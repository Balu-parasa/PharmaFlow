export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PHARMACIST' | 'CASHIER';
  phone?: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  sku: string;
  barcode?: string;
  category: string;
  dosageForm: string;
  strength?: string;
  minStockThreshold: number;
  requiresPrescription: boolean;
  description?: string;
  totalStock: number;
  isLowStock: boolean;
  activeBatchesCount?: number;
  batches?: Batch[];
  nextExpiringBatch?: Batch | null;
}

export interface Batch {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  manufacturingDate?: string;
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number;
  initialQuantity: number;
  isRecalled: boolean;
  medicine?: Medicine;
}

export interface CartItem {
  batchId: string;
  medicineId: string;
  medicineName: string;
  genericName?: string;
  dosageForm: string;
  strength?: string;
  batchNumber: string;
  expiryDate: string;
  unitPrice: number;
  quantity: number;
  maxAvailable: number;
  discount: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customer?: { name: string; phone?: string };
  cashierId: string;
  cashier?: { name: string };
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
    batch: {
      batchNumber: string;
      medicine: {
        name: string;
        dosageForm: string;
      };
    };
  }>;
}

export interface Prescription {
  id: string;
  prescriptionCode: string;
  customer: { name: string; phone?: string };
  doctorName: string;
  doctorLicense?: string;
  clinicHospital?: string;
  status: 'PENDING' | 'DISPENSED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  items: Array<{
    id: string;
    dosageInstructions: string;
    quantityRequired: number;
    medicine: Medicine;
  }>;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  _count?: {
    purchaseOrders: number;
  };
}

export interface DashboardSummary {
  todayRevenue: number;
  todaySalesCount: number;
  totalRevenue: number;
  totalSalesCount: number;
  lowStockCount: number;
  expiredCount: number;
  nearExpiryCount: number;
  totalCustomers: number;
  totalMedicinesCount: number;
  recentSales: Sale[];
}

