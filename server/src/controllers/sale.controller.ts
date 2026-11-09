import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { allocateFEFOBatches } from '../services/fefo.service.js';

export const createSale = async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      prescriptionId,
      items, // array of { batchId?: string, medicineId?: string, quantity: number, unitPrice?: number, discount?: number }
      autoFEFO = false, // If true, items specify medicineId + quantity, and server automatically allocates batches via FEFO
      paymentMethod,
      discountAmount = 0,
      taxAmount = 0,
      notes,
      idempotencyKey: bodyIdempotencyKey
    } = req.body;

    const cashierId = req.user?.id;
    if (!cashierId) {
      return res.status(401).json({ success: false, message: 'Cashier authentication required.' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Sale must include at least one item.' });
    }

    // 1. Idempotency Key Handling
    const idempotencyKey = (req.headers['idempotency-key'] as string) || bodyIdempotencyKey || null;
    const payloadHash = idempotencyKey 
      ? crypto.createHash('sha256').update(JSON.stringify({ customerId, customerPhone, items, autoFEFO, paymentMethod, discountAmount, taxAmount })).digest('hex')
      : null;

    if (idempotencyKey) {
      const existingSale = await prisma.sale.findUnique({
        where: { idempotencyKey },
        include: {
          customer: true,
          cashier: { select: { id: true, name: true, email: true } },
          prescription: true,
          items: {
            include: {
              batch: { include: { medicine: true } }
            }
          }
        }
      });

      if (existingSale) {
        if (existingSale.payloadHash && existingSale.payloadHash !== payloadHash) {
          return res.status(422).json({
            success: false,
            message: 'Idempotency conflict: key already used with different payload parameters.'
          });
        }
        return res.status(200).json({
          success: true,
          message: 'Sale already processed (idempotent replay).',
          isIdempotentReplay: true,
          data: existingSale
        });
      }
    }

    // Generate unique invoice number: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;
    const now = new Date();

    // Execute atomic transaction for stock deduction & sale generation
    const saleResult = await prisma.$transaction(async (tx) => {
      // 1. Resolve or create customer if phone provided
      let finalCustomerId = customerId;
      if (!finalCustomerId && customerPhone) {
        let customer = await tx.customer.findUnique({ where: { phone: customerPhone } });
        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: customerName || 'Walk-in Customer',
              phone: customerPhone
            }
          });
        }
        finalCustomerId = customer.id;
      }

      // 2. Prepare lines with FEFO validation
      let calculatedSubtotal = 0;
      const resolvedSaleItems: Array<{
        batchId: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        totalPrice: number;
      }> = [];

      if (autoFEFO) {
        // Automatic FEFO mode: request contains { medicineId, quantity }
        for (const it of items) {
          if (!it.medicineId || !it.quantity || it.quantity <= 0) {
            throw new Error('Each autoFEFO item must specify valid medicineId and positive quantity.');
          }
          const fefoAllocations = await allocateFEFOBatches(tx, it.medicineId, it.quantity);
          for (const alloc of fefoAllocations) {
            const linePrice = alloc.unitPrice;
            const lineDiscount = it.discount ? (it.discount / it.quantity) * alloc.quantity : 0;
            const lineTotal = alloc.quantity * linePrice - lineDiscount;

            // Deduct stock
            const updatedBatch = await tx.batch.update({
              where: { id: alloc.batchId },
              data: { quantityInStock: { decrement: alloc.quantity } }
            });

            // Record immutable stock movement
            await tx.stockMovement.create({
              data: {
                batchId: alloc.batchId,
                userId: cashierId,
                type: 'SALE',
                quantity: -alloc.quantity,
                balanceAfter: updatedBatch.quantityInStock,
                reason: `Sale ${invoiceNumber} (Auto-FEFO)`,
                referenceId: invoiceNumber
              }
            });

            calculatedSubtotal += lineTotal;
            resolvedSaleItems.push({
              batchId: alloc.batchId,
              quantity: alloc.quantity,
              unitPrice: linePrice,
              discount: lineDiscount,
              totalPrice: lineTotal
            });
          }
        }
      } else {
        // Explicit batch mode: validate individual batch status and enforce FEFO policy
        for (const item of items) {
          if (!item.batchId) {
            throw new Error('Item must specify batchId or use autoFEFO=true.');
          }

          const batch = await tx.batch.findUnique({
            where: { id: item.batchId },
            include: { medicine: true }
          });

          if (!batch) {
            throw new Error(`Batch ID ${item.batchId} not found`);
          }

          if (batch.isRecalled) {
            throw new Error(`Batch ${batch.batchNumber} (${batch.medicine.name}) has been recalled.`);
          }

          // Strict block on expired batches
          if (new Date(batch.expiryDate) <= now) {
            throw new Error(
              `Batch ${batch.batchNumber} (${batch.medicine.name}) expired on ${new Date(
                batch.expiryDate
              ).toISOString().slice(0, 10)}. Selling expired medicines is strictly forbidden by FEFO policy.`
            );
          }

          // Strict prevention of negative stock
          if (batch.quantityInStock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${batch.medicine.name} (Batch: ${batch.batchNumber}). Requested: ${item.quantity}, Available: ${batch.quantityInStock}`
            );
          }

          // Enforce FEFO warning / verification: Check if an earlier non-expired batch exists with stock
          const earlierBatch = await tx.batch.findFirst({
            where: {
              medicineId: batch.medicineId,
              isRecalled: false,
              expiryDate: {
                gt: now,
                lt: batch.expiryDate
              },
              quantityInStock: { gt: 0 }
            },
            orderBy: { expiryDate: 'asc' }
          });

          if (earlierBatch) {
            // Log audit note that a non-FEFO batch was manually selected when an earlier expiring batch was available
            await tx.auditLog.create({
              data: {
                userId: cashierId,
                action: 'FEFO_OVERRIDE_WARNING',
                entity: 'Batch',
                entityId: batch.id,
                details: JSON.stringify({
                  chosenBatch: batch.batchNumber,
                  chosenExpiry: batch.expiryDate,
                  earlierAvailableBatch: earlierBatch.batchNumber,
                  earlierExpiry: earlierBatch.expiryDate
                })
              }
            });
          }

          // Atomic decrement
          const updatedBatch = await tx.batch.update({
            where: { id: batch.id },
            data: {
              quantityInStock: { decrement: item.quantity }
            }
          });

          // Stock movement audit
          await tx.stockMovement.create({
            data: {
              batchId: batch.id,
              userId: cashierId,
              type: 'SALE',
              quantity: -item.quantity,
              balanceAfter: updatedBatch.quantityInStock,
              reason: `Sale ${invoiceNumber}`,
              referenceId: invoiceNumber
            }
          });

          const unitPrice = item.unitPrice ?? batch.sellingPrice;
          const discount = item.discount || 0;
          const lineTotal = item.quantity * unitPrice - discount;
          calculatedSubtotal += lineTotal;

          resolvedSaleItems.push({
            batchId: item.batchId,
            quantity: item.quantity,
            unitPrice,
            discount,
            totalPrice: lineTotal
          });
        }
      }

      const totalAmount = Math.max(0, calculatedSubtotal + Number(taxAmount) - Number(discountAmount));

      // 3. Create Sale record
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          idempotencyKey,
          payloadHash,
          customerId: finalCustomerId || null,
          cashierId,
          prescriptionId: prescriptionId || null,
          subTotal: calculatedSubtotal,
          taxAmount: Number(taxAmount),
          discountAmount: Number(discountAmount),
          totalAmount,
          paymentMethod: paymentMethod || 'CASH',
          paymentStatus: 'PAID',
          notes,
          items: {
            create: resolvedSaleItems
          }
        },
        include: {
          customer: true,
          cashier: { select: { id: true, name: true, email: true } },
          prescription: true,
          items: {
            include: {
              batch: {
                include: { medicine: true }
              }
            }
          }
        }
      });

      // 4. Update prescription items if linked
      if (prescriptionId) {
        await tx.prescription.update({
          where: { id: prescriptionId },
          data: { status: 'DISPENSED' }
        });
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: cashierId,
          action: 'SALE_COMPLETED',
          entity: 'Sale',
          entityId: sale.id,
          details: JSON.stringify({
            invoiceNumber,
            totalAmount,
            itemCount: resolvedSaleItems.length,
            fefoCompliant: true
          })
        }
      });

      return sale;
    });

    res.status(201).json({
      success: true,
      message: 'Sale completed successfully under FEFO policy',
      data: saleResult
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const returnSale = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // saleId
    const { items, reason } = req.body; // items: array of { saleItemId: string, quantity: number }, reason: required string

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid reason is required for processing a sales return.'
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const returnResult = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: { include: { batch: true } } }
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      for (const retItem of items) {
        const saleItem = sale.items.find((si) => si.id === retItem.saleItemId);
        if (!saleItem) {
          throw new Error(`Sale item ${retItem.saleItemId} does not belong to this sale.`);
        }
        if (retItem.quantity > saleItem.quantity) {
          throw new Error(`Cannot return ${retItem.quantity} units. Original sold quantity was ${saleItem.quantity}.`);
        }

        // Restock batch
        const updatedBatch = await tx.batch.update({
          where: { id: saleItem.batchId },
          data: { quantityInStock: { increment: retItem.quantity } }
        });

        // Record stock movement with required reason
        await tx.stockMovement.create({
          data: {
            batchId: saleItem.batchId,
            userId,
            type: 'RETURN',
            quantity: retItem.quantity,
            balanceAfter: updatedBatch.quantityInStock,
            reason: `Return for ${sale.invoiceNumber}: ${reason}`,
            referenceId: sale.invoiceNumber
          }
        });
      }

      await tx.sale.update({
        where: { id },
        data: { paymentStatus: 'REFUNDED' }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'RETURN_PROCESSED',
          entity: 'Sale',
          entityId: sale.id,
          details: JSON.stringify({ reason, returnedItems: items })
        }
      });

      return { saleId: id, status: 'REFUNDED' };
    });

    res.json({ success: true, message: 'Return processed and inventory restocked', data: returnResult });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSalesHistory = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, invoiceNumber, cashierId } = req.query;

    const where: any = {};
    if (invoiceNumber) {
      where.invoiceNumber = { contains: String(invoiceNumber) };
    }
    if (cashierId) {
      where.cashierId = String(cashierId);
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(String(startDate));
      if (endDate) where.createdAt.lte = new Date(String(endDate));
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        cashier: { select: { id: true, name: true } },
        items: {
          include: {
            batch: {
              include: { medicine: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({ success: true, count: sales.length, data: sales });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSaleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        cashier: { select: { id: true, name: true, phone: true } },
        prescription: true,
        items: {
          include: {
            batch: {
              include: { medicine: true }
            }
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale invoice not found' });
    }

    res.json({ success: true, data: sale });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
