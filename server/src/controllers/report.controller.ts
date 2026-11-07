import { Request, Response } from 'express';
import prisma from '../config/db.js';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 1. Today's sales
    const todaySales = await prisma.sale.aggregate({
      where: {
        createdAt: { gte: startOfToday }
      },
      _sum: { totalAmount: true },
      _count: { id: true }
    });

    // 2. All-time revenue
    const allTimeSales = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true }
    });

    // 3. Low stock and inventory valuation
    const batches = await prisma.batch.findMany({
      where: { isRecalled: false },
      include: { medicine: true }
    });

    let totalStockUnits = 0;
    let totalValuation = 0;
    const medicineStockMap: Record<string, { med: any; stock: number }> = {};

    for (const b of batches) {
      totalStockUnits += b.quantityInStock;
      totalValuation += b.quantityInStock * b.costPrice;

      if (!medicineStockMap[b.medicineId]) {
        medicineStockMap[b.medicineId] = { med: b.medicine, stock: 0 };
      }
      medicineStockMap[b.medicineId].stock += b.quantityInStock;
    }

    const allMedicines = await prisma.medicine.findMany();
    let lowStockCount = 0;
    for (const m of allMedicines) {
      const currentStock = medicineStockMap[m.id]?.stock || 0;
      if (currentStock <= m.minStockThreshold) {
        lowStockCount++;
      }
    }

    // 4. Near expiry and expired counts
    const expiredCount = await prisma.batch.count({
      where: {
        expiryDate: { lte: now },
        quantityInStock: { gt: 0 }
      }
    });

    const nearExpiryCount = await prisma.batch.count({
      where: {
        expiryDate: {
          gt: now,
          lte: thirtyDaysAhead
        },
        quantityInStock: { gt: 0 }
      }
    });

    // 5. Total customers & suppliers
    const totalCustomers = await prisma.customer.count();
    const totalSuppliers = await prisma.supplier.count();

    // 6. Recent sales
    const recentSales = await prisma.sale.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        cashier: { select: { name: true } },
        _count: { select: { items: true } }
      }
    });

    // 7. Recent stock movements
    const recentMovements = await prisma.stockMovement.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        batch: { include: { medicine: true } },
        user: { select: { name: true, role: true } }
      }
    });

    // 8. Top selling medicines by quantity sold
    const topSaleItems = await prisma.saleItem.groupBy({
      by: ['batchId'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topSellingMedicines = await Promise.all(
      topSaleItems.map(async (item) => {
        const batch = await prisma.batch.findUnique({
          where: { id: item.batchId },
          include: { medicine: true }
        });
        return {
          medicineName: batch?.medicine.name || 'Unknown',
          dosageForm: batch?.medicine.dosageForm || 'Unit',
          totalQuantitySold: item._sum.quantity || 0,
          totalRevenue: item._sum.totalPrice || 0
        };
      })
    );

    res.json({
      success: true,
      data: {
        todayRevenue: todaySales._sum.totalAmount || 0,
        todaySalesCount: todaySales._count.id || 0,
        totalRevenue: allTimeSales._sum.totalAmount || 0,
        totalSalesCount: allTimeSales._count.id || 0,
        totalStockUnits,
        totalValuation,
        lowStockCount,
        expiredCount,
        nearExpiryCount,
        totalCustomers,
        totalSuppliers,
        totalMedicinesCount: allMedicines.length,
        recentSales,
        recentMovements,
        topSellingMedicines
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, role: true, email: true } }
      }
    });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { sales: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
