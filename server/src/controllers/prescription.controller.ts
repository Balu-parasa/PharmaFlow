import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getPrescriptions = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status) {
      where.status = String(status);
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { prescriptionCode: { contains: q } },
        { doctorName: { contains: q } },
        { customer: { name: { contains: q } } },
        { customer: { phone: { contains: q } } }
      ];
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            medicine: {
              include: {
                batches: {
                  where: { isRecalled: false, quantityInStock: { gt: 0 } },
                  orderBy: { expiryDate: 'asc' }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      doctorName,
      doctorLicense,
      clinicHospital,
      notes,
      items
    } = req.body;

    // Resolve or create customer
    let targetCustomerId = customerId;
    if (!targetCustomerId && customerPhone) {
      let customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: customerName,
            phone: customerPhone
          }
        });
      }
      targetCustomerId = customer.id;
    } else if (!targetCustomerId) {
      const customer = await prisma.customer.create({
        data: { name: customerName }
      });
      targetCustomerId = customer.id;
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const prescriptionCode = `RX-${new Date().getFullYear()}-${randomCode}`;

    const prescription = await prisma.prescription.create({
      data: {
        prescriptionCode,
        customerId: targetCustomerId,
        doctorName,
        doctorLicense,
        clinicHospital,
        notes,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            medicineId: item.medicineId,
            dosageInstructions: item.dosageInstructions,
            quantityRequired: item.quantityRequired,
            quantityDispensed: 0
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: { medicine: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Prescription recorded successfully',
      data: prescription
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

