import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const createSale = async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      prescriptionId,
      items,
      paymentMethod,
      discountAmount = 0,
      taxAmount = 0,
      notes
    } = req.body;

    const cashierId = req.user?.id;
    if (!cashierId) {
      return res.status(401).json({ success: false, message: 'Cashier authentication required.' });
    }

    // Generate unique invoice number: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

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

      // 2. Validate all batches and stock availability
      let calculatedSubtotal = 0;
      const saleItemsData = [];

      for (const item of items) {
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

        // Check if expired
        if (new Date(batch.expiryDate) <= new Date()) {
          throw new Error(`Batch ${batch.batchNumber} (${batch.medicine.name}) has expired. Cannot sell expired medicines.`);
        }

        // Check stock availability
        if (batch.quantityInStock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${batch.medicine.name} (Batch: ${batch.batchNumber}). Requested: ${item.quantity}, Available: ${batch.quantityInStock}`
          );
        }

        // Deduct inventory
        await tx.batch.update({
          where: { id: batch.id },
          data: {
            quantityInStock: { decrement: item.quantity }
          }
        });

        const lineTotal = item.quantity * item.unitPrice - (item.discount || 0);
        calculatedSubtotal += lineTotal;

        saleItemsData.push({
          batchId: item.batchId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          totalPrice: lineTotal
        });
      }

      const totalAmount = Math.max(0, calculatedSubtotal + Number(taxAmount) - Number(discountAmount));

      // 3. Create Sale record
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
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
            create: saleItemsData
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
            itemCount: items.length
          })
        }
      });

      return sale;
    });

    res.status(201).json({
      success: true,
      message: 'Sale completed successfully',
      data: saleResult
    });
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

