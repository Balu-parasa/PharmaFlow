import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getMedicines = async (req: Request, res: Response) => {
  try {
    const { search, category, requiresPrescription } = req.query;

    const where: any = {};
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { genericName: { contains: q } },
        { sku: { contains: q } },
        { barcode: { contains: q } }
      ];
    }

    if (category) {
      where.category = String(category);
    }

    if (requiresPrescription !== undefined) {
      where.requiresPrescription = requiresPrescription === 'true';
    }

    const medicines = await prisma.medicine.findMany({
      where,
      include: {
        batches: {
          where: { isRecalled: false },
          orderBy: { expiryDate: 'asc' } // FIFO ordering
        }
      },
      orderBy: { name: 'asc' }
    });

    // Compute total stock and earliest expiry for each medicine
    const enriched = medicines.map((med) => {
      const totalStock = med.batches.reduce((sum, b) => sum + b.quantityInStock, 0);
      const activeBatches = med.batches.filter((b) => b.quantityInStock > 0);
      const isLowStock = totalStock <= med.minStockThreshold;

      return {
        ...med,
        totalStock,
        isLowStock,
        activeBatchesCount: activeBatches.length,
        nextExpiringBatch: activeBatches[0] || null
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        batches: {
          orderBy: { expiryDate: 'asc' }
        }
      }
    });

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    const totalStock = medicine.batches.reduce((sum, b) => sum + b.quantityInStock, 0);
    res.json({
      success: true,
      data: {
        ...medicine,
        totalStock,
        isLowStock: totalStock <= medicine.minStockThreshold
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      genericName,
      sku,
      barcode,
      category,
      dosageForm,
      strength,
      minStockThreshold,
      requiresPrescription,
      description
    } = req.body;

    const existingSku = await prisma.medicine.findUnique({ where: { sku } });
    if (existingSku) {
      return res.status(400).json({ success: false, message: 'Medicine with this SKU already exists' });
    }

    if (barcode) {
      const existingBarcode = await prisma.medicine.findUnique({ where: { barcode } });
      if (existingBarcode) {
        return res.status(400).json({ success: false, message: 'Medicine with this Barcode already exists' });
      }
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        genericName,
        sku,
        barcode: barcode || null,
        category,
        dosageForm,
        strength,
        minStockThreshold: Number(minStockThreshold) || 10,
        requiresPrescription: Boolean(requiresPrescription),
        description
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'CREATE_MEDICINE',
        entity: 'Medicine',
        entityId: medicine.id,
        details: JSON.stringify({ name: medicine.name, sku: medicine.sku })
      }
    });

    res.status(201).json({ success: true, message: 'Medicine added successfully', data: medicine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const medicine = await prisma.medicine.update({
      where: { id },
      data: updateData
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'UPDATE_MEDICINE',
        entity: 'Medicine',
        entityId: medicine.id,
        details: JSON.stringify(updateData)
      }
    });

    res.json({ success: true, message: 'Medicine updated successfully', data: medicine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

