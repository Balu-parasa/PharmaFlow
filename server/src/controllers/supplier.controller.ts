import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: { purchaseOrders: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const { name, contactPerson, email, phone, address, gstin } = req.body;
    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactPerson,
        email: email || null,
        phone,
        address,
        gstin
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'CREATE_SUPPLIER',
        entity: 'Supplier',
        entityId: supplier.id,
        details: JSON.stringify({ name: supplier.name, phone: supplier.phone })
      }
    });

    res.status(201).json({ success: true, message: 'Supplier added successfully', data: supplier });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        batches: {
          include: { medicine: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPurchaseOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { supplierId, items } = req.body;
    // items: Array of { medicineId, batchNumber, expiryDate, manufacturingDate, costPrice, sellingPrice, quantity }

    if (!supplierId) {
      return res.status(400).json({ success: false, message: 'Supplier ID is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Purchase order must include at least one batch item' });
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      // Validate batches first
      for (const it of items) {
        if (!it.medicineId || !it.batchNumber || !it.expiryDate || !it.quantity || !it.costPrice || !it.sellingPrice) {
          throw new Error('All batch fields (medicine, batchNumber, expiryDate, costPrice, sellingPrice, quantity) are required.');
        }

        if (new Date(it.expiryDate) <= now) {
          throw new Error(`Cannot receive batch ${it.batchNumber} that has already expired (${it.expiryDate}).`);
        }

        if (it.quantity <= 0 || it.costPrice <= 0 || it.sellingPrice <= 0) {
          throw new Error('Quantity, cost price, and selling price must all be positive numbers.');
        }

        // Check if batch number already exists for this medicine
        const existingBatch = await tx.batch.findUnique({
          where: {
            medicineId_batchNumber: {
              medicineId: it.medicineId,
              batchNumber: it.batchNumber
            }
          }
        });
        if (existingBatch) {
          throw new Error(`Batch number '${it.batchNumber}' already exists for this medicine. Use another batch number or adjust existing batch.`);
        }

        totalAmount += Number(it.costPrice) * Number(it.quantity);
      }

      // Create purchase order
      const po = await tx.purchaseOrder.create({
        data: {
          orderNumber,
          supplierId,
          totalAmount,
          status: 'RECEIVED'
        }
      });

      // Create batches and stock movement records
      const createdBatches = [];
      for (const it of items) {
        const batch = await tx.batch.create({
          data: {
            medicineId: it.medicineId,
            batchNumber: it.batchNumber,
            expiryDate: new Date(it.expiryDate),
            manufacturingDate: it.manufacturingDate ? new Date(it.manufacturingDate) : null,
            costPrice: Number(it.costPrice),
            sellingPrice: Number(it.sellingPrice),
            initialQuantity: Number(it.quantity),
            quantityInStock: Number(it.quantity),
            purchaseOrderId: po.id
          },
          include: { medicine: true }
        });

        // Record immutable stock movement
        await tx.stockMovement.create({
          data: {
            batchId: batch.id,
            userId: req.user?.id,
            type: 'RESTOCK',
            quantity: Number(it.quantity),
            balanceAfter: Number(it.quantity),
            reason: `Purchase receipt under ${orderNumber} from ${supplier.name}`,
            referenceId: orderNumber
          }
        });

        createdBatches.push(batch);
      }

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'PURCHASE_RECEIVED',
          entity: 'PurchaseOrder',
          entityId: po.id,
          details: JSON.stringify({
            orderNumber,
            supplier: supplier.name,
            totalAmount,
            batchCount: items.length
          })
        }
      });

      return {
        ...po,
        batches: createdBatches
      };
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order received and batch inventory updated successfully',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
