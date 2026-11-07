import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getBatches = async (req: Request, res: Response) => {
  try {
    const { medicineId, nearExpiry, expired } = req.query;

    const where: any = {};
    if (medicineId) {
      where.medicineId = String(medicineId);
    }

    const now = new Date();

    if (expired === 'true') {
      where.expiryDate = { lte: now };
    } else if (nearExpiry === 'true') {
      const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      where.expiryDate = {
        gte: now,
        lte: thirtyDaysAhead
      };
      where.quantityInStock = { gt: 0 };
    }

    const batches = await prisma.batch.findMany({
      where,
      include: {
        medicine: true
      },
      orderBy: { expiryDate: 'asc' }
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

    const batch = await prisma.batch.create({
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

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'ADD_BATCH',
        entity: 'Batch',
        entityId: batch.id,
        details: JSON.stringify({ batchNumber, quantity, medicine: batch.medicine.name })
      }
    });

    res.status(201).json({ success: true, message: 'Stock batch added successfully', data: batch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adjustment, reason } = req.body; // adjustment can be positive or negative integer

    const batch = await prisma.batch.findUnique({ where: { id } });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const newQuantity = batch.quantityInStock + Number(adjustment);
    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot deduct ${Math.abs(adjustment)} units. Current stock is only ${batch.quantityInStock}.`
      });
    }

    const updated = await prisma.batch.update({
      where: { id },
      data: { quantityInStock: newQuantity }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'STOCK_ADJUSTMENT',
        entity: 'Batch',
        entityId: batch.id,
        details: JSON.stringify({
          batchNumber: batch.batchNumber,
          oldQty: batch.quantityInStock,
          newQty: newQuantity,
          difference: adjustment,
          reason
        })
      }
    });

    res.json({ success: true, message: 'Stock adjusted successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpiryAlerts = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expired = await prisma.batch.findMany({
      where: {
        expiryDate: { lte: now },
        quantityInStock: { gt: 0 }
      },
      include: { medicine: true },
      orderBy: { expiryDate: 'asc' }
    });

    const expiringSoon = await prisma.batch.findMany({
      where: {
        expiryDate: {
          gt: now,
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

