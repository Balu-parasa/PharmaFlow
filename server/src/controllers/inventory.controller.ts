import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { getEndOfTodayIST, getFutureISTBoundary } from '../utils/expiry.js';

export const getBatches = async (req: Request, res: Response) => {
  try {
    const { medicineId, nearExpiry, expired } = req.query;

    const where: any = {};
    if (medicineId) {
      where.medicineId = String(medicineId);
    }

    const endOfToday = getEndOfTodayIST();

    if (expired === 'true') {
      where.expiryDate = { lte: endOfToday };
    } else if (nearExpiry === 'true') {
      const thirtyDaysAhead = getFutureISTBoundary(30);
      where.expiryDate = {
        gt: endOfToday,
        lte: thirtyDaysAhead
      };
      where.quantityInStock = { gt: 0 };
    }

    const batches = await prisma.batch.findMany({
      where,
      include: {
        medicine: true
      },
      orderBy: { expiryDate: 'asc' } // FEFO order
    });

    res.json({ success: true, count: batches.length, data: batches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addBatch = async (req: AuthRequest, res: Response) => {
  try {
    const {
      medicineId,
      batchNumber,
      expiryDate,
      manufacturingDate,
      costPrice,
      sellingPrice,
      quantity,
      purchaseOrderId
    } = req.body;

    const existingBatch = await prisma.batch.findUnique({
      where: {
        medicineId_batchNumber: {
          medicineId,
          batchNumber
        }
      }
    });

    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'A batch with this number already exists for this medicine.'
      });
    }

    const batch = await prisma.$transaction(async (tx) => {
      const b = await tx.batch.create({
        data: {
          medicineId,
          batchNumber,
          expiryDate: new Date(expiryDate),
          manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
          costPrice: Number(costPrice),
          sellingPrice: Number(sellingPrice),
          initialQuantity: Number(quantity),
          quantityInStock: Number(quantity),
          purchaseOrderId: purchaseOrderId || null
        },
        include: {
          medicine: true
        }
      });

      // Record immutable stock movement
      await tx.stockMovement.create({
        data: {
          batchId: b.id,
          userId: req.user?.id,
          type: 'RESTOCK',
          quantity: Number(quantity),
          balanceAfter: Number(quantity),
          reason: `Stock receipt batch ${batchNumber}`,
          referenceId: purchaseOrderId || batchNumber
        }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'ADD_BATCH',
          entity: 'Batch',
          entityId: b.id,
          details: JSON.stringify({ batchNumber, quantity, medicine: b.medicine.name })
        }
      });

      return b;
    }, {
      maxWait: 5000,
      timeout: 15000
    });

    res.status(201).json({ success: true, message: 'Stock batch added successfully', data: batch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adjustment, reason } = req.body; // adjustment can be positive or negative integer, reason is mandatory

    if (!reason || String(reason).trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid reason is required for any manual stock adjustment.'
      });
    }

    const delta = Number(adjustment);
    if (isNaN(delta) || delta === 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment must be a non-zero integer number.'
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const batch = await tx.batch.findUnique({ where: { id } });
      if (!batch) {
        throw new Error('Batch not found');
      }

      const newQuantity = batch.quantityInStock + delta;
      if (newQuantity < 0) {
        throw new Error(`Cannot deduct ${Math.abs(delta)} units. Current stock is only ${batch.quantityInStock}.`);
      }

      const b = await tx.batch.update({
        where: { id },
        data: { quantityInStock: newQuantity }
      });

      // Record stock movement
      await tx.stockMovement.create({
        data: {
          batchId: b.id,
          userId: req.user?.id,
          type: 'ADJUSTMENT',
          quantity: delta,
          balanceAfter: newQuantity,
          reason: String(reason).trim(),
          referenceId: `ADJ-${new Date().toISOString().slice(0, 10)}`
        }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'STOCK_ADJUSTMENT',
          entity: 'Batch',
          entityId: b.id,
          details: JSON.stringify({
            batchNumber: batch.batchNumber,
            oldQty: batch.quantityInStock,
            newQty: newQuantity,
            difference: delta,
            reason
          })
        }
      });

      return b;
    }, {
      maxWait: 5000,
      timeout: 15000
    });

    res.json({ success: true, message: 'Stock adjusted successfully', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getExpiryAlerts = async (req: Request, res: Response) => {
  try {
    const endOfToday = getEndOfTodayIST();
    const thirtyDaysAhead = getFutureISTBoundary(30);

    const expired = await prisma.batch.findMany({
      where: {
        expiryDate: { lte: endOfToday },
        quantityInStock: { gt: 0 }
      },
      include: { medicine: true },
      orderBy: { expiryDate: 'asc' }
    });

    const expiringSoon = await prisma.batch.findMany({
      where: {
        expiryDate: {
          gt: endOfToday,
          lte: thirtyDaysAhead
        },
        quantityInStock: { gt: 0 }
      },
      include: { medicine: true },
      orderBy: { expiryDate: 'asc' }
    });

    res.json({
      success: true,
      data: {
        expiredCount: expired.length,
        expiringSoonCount: expiringSoon.length,
        expired,
        expiringSoon
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.query;
    const where: any = {};
    if (batchId) {
      where.batchId = String(batchId);
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        batch: { include: { medicine: true } },
        user: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({ success: true, count: movements.length, data: movements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
