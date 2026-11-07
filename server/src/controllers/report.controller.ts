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

    // 3. Low stock count
    const medicines = await prisma.medicine.findMany({
      include: {
        batches: {
          where: { isRecalled: false }
        }
      }
    });

    const lowStockMedicines = medicines.filter((med) => {
      const stock = med.batches.reduce((sum, b) => sum + b.quantityInStock, 0);
      return stock <= med.minStockThreshold;
    });

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

    // 5. Total customers
    const totalCustomers = await prisma.customer.count();

    // 6. Recent 5 sales
    const recentSales = await prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        cashier: { select: { name: true } },
        _count: { select: { items: true } }
      }
    });

    res.json({
      success: true,
      data: {
        todayRevenue: todaySales._sum.totalAmount || 0,
        todaySalesCount: todaySales._count.id || 0,
        totalRevenue: allTimeSales._sum.totalAmount || 0,
        totalSalesCount: allTimeSales._count.id || 0,
        lowStockCount: lowStockMedicines.length,
        expiredCount,
        nearExpiryCount,
        totalCustomers,
        totalMedicinesCount: medicines.length,
        recentSales
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

