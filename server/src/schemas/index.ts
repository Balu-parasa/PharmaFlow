import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'PHARMACIST', 'CASHIER']).default('CASHIER'),
  phone: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  genericName: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  dosageForm: z.string().min(1, 'Dosage form is required'),
  strength: z.string().optional(),
  minStockThreshold: z.number().int().nonnegative().default(10),
  requiresPrescription: z.boolean().default(false),
  description: z.string().optional()
});

export const batchSchema = z.object({
  medicineId: z.string().uuid('Valid medicine ID required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  manufacturingDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  costPrice: z.number().positive('Cost price must be greater than 0'),
  sellingPrice: z.number().positive('Selling price must be greater than 0'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  purchaseOrderId: z.string().uuid().optional()
});

export const saleItemSchema = z.object({
  batchId: z.string().uuid('Valid batch ID required').optional(),
  medicineId: z.string().uuid('Valid medicine ID required').optional(),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  unitPrice: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().default(0)
});

export const createSaleSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  prescriptionId: z.string().uuid().optional(),
  autoFEFO: z.boolean().default(false),
  items: z.array(saleItemSchema).min(1, 'Sale must include at least one item'),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI']).default('CASH'),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  notes: z.string().optional()
});

export const prescriptionSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().optional(),
  doctorName: z.string().min(1, 'Doctor name is required'),
  doctorLicense: z.string().optional(),
  clinicHospital: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      medicineId: z.string().uuid('Valid medicine ID required'),
      dosageInstructions: z.string().min(1, 'Dosage instructions required'),
      quantityRequired: z.number().int().positive('Quantity required must be positive')
    })
  ).min(1, 'Prescription must contain at least one item')
});

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(5, 'Phone number is required'),
  address: z.string().optional(),
  gstin: z.string().optional()
});
