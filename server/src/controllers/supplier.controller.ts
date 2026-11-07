import { Request, Response } from 'express';
import prisma from '../config/db.js';

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

export const createSupplier = async (req: Request, res: Response) => {
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
    res.status(201).json({ success: true, message: 'Supplier added successfully', data: supplier });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

