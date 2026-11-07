import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding PharmaFlow Database ---');

  // Clean existing tables
  await prisma.auditLog.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users (Admin, Pharmacist, Cashier)
  const passwordHash = await bcrypt.hash('admin123', 10);
  const staffPasswordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Jenkins (Admin)',
      email: 'admin@pharmaflow.com',
      passwordHash,
      role: 'ADMIN',
      phone: '+91 98765 43210'
    }
  });

  const pharmacist = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma (Lead Pharmacist)',
      email: 'pharmacist@pharmaflow.com',
      passwordHash: staffPasswordHash,
      role: 'PHARMACIST',
      phone: '+91 98765 43211'
    }
  });

  const cashier = await prisma.user.create({
    data: {
      name: 'Anita Verma (Cashier)',
      email: 'cashier@pharmaflow.com',
      passwordHash: staffPasswordHash,
      role: 'CASHIER',
      phone: '+91 98765 43212'
    }
  });

  console.log('✓ Users created: Admin, Pharmacist, Cashier');

  // 2. Seed Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Apex Pharma Distributors',
      contactPerson: 'Vikas Gupta',
      phone: '+91 98111 22334',
      email: 'orders@apexpharma.com',
      address: 'Plot 45, Okhla Industrial Area, Phase-III, New Delhi',
      gstin: '07AAAAA0000A1Z5'
    }
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'MedLife Global Healthcare',
      contactPerson: 'Sunil Nair',
      phone: '+91 98222 33445',
      email: 'contact@medlifeglobal.com',
      address: '22 Electronic City, Bengaluru, Karnataka',
      gstin: '29BBBBB1111B2Z6'
    }
  });

  console.log('✓ Suppliers created');

  // 3. Seed Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rohan Mehra',
      phone: '9845012345',
      email: 'rohan.mehra@gmail.com',
      address: 'B-402, Green Glen Layout, Bengaluru'
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Priya Sundaram',
      phone: '9845098765',
      email: 'priya.s@yahoo.com',
      address: '14/A, Indiranagar 1st Stage, Bengaluru'
    }
  });

  console.log('✓ Customers created');

  // 4. Seed Medicines
  const paracetamol = await prisma.medicine.create({
    data: {
      name: 'Dolo 650',
      genericName: 'Paracetamol',
      sku: 'MED-DOLO-650',
      barcode: '8901234001',
      category: 'Analgesics & Antipyretics',
      dosageForm: 'Tablet',
      strength: '650mg',
      minStockThreshold: 30,
      requiresPrescription: false,
      description: 'Used for mild to moderate pain and fever relief.'
    }
  });

  const amoxicillin = await prisma.medicine.create({
    data: {
      name: 'Augmentin 625 Duo',
      genericName: 'Amoxicillin + Clavulanic Acid',
      sku: 'MED-AUG-625',
      barcode: '8901234002',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      strength: '625mg',
      minStockThreshold: 20,
      requiresPrescription: true,
      description: 'Broad-spectrum penicillin antibiotic for bacterial infections.'
    }
  });

  const cetirizine = await prisma.medicine.create({
    data: {
      name: 'Cetzine 10mg',
      genericName: 'Cetirizine Hydrochloride',
      sku: 'MED-CETZ-10',
      barcode: '8901234003',
      category: 'Antihistamines',
      dosageForm: 'Tablet',
      strength: '10mg',
      minStockThreshold: 15,
      requiresPrescription: false,
      description: 'Relief of allergy symptoms including runny nose and itching.'
    }
  });

  const pantocid = await prisma.medicine.create({
    data: {
      name: 'Pantocid 40',
      genericName: 'Pantoprazole Sodium',
      sku: 'MED-PAN-40',
      barcode: '8901234004',
      category: 'Gastrointestinal',
      dosageForm: 'Tablet',
      strength: '40mg',
      minStockThreshold: 25,
      requiresPrescription: false,
      description: 'Proton pump inhibitor used to treat acidity and GERD.'
    }
  });

  const azithromycin = await prisma.medicine.create({
    data: {
      name: 'Azithral 500',
      genericName: 'Azithromycin',
      sku: 'MED-AZI-500',
      barcode: '8901234005',
      category: 'Antibiotics',
      dosageForm: 'Tablet',
      strength: '500mg',
      minStockThreshold: 15,
      requiresPrescription: true,
      description: 'Macrolide antibiotic for respiratory tract infections.'
    }
  });

  const coughSyrup = await prisma.medicine.create({
    data: {
      name: 'Ascoril D Plus',
      genericName: 'Dextromethorphan + Phenylephrine',
      sku: 'MED-ASC-100ML',
      barcode: '8901234006',
      category: 'Respiratory',
      dosageForm: 'Syrup',
      strength: '100ml',
      minStockThreshold: 10,
      requiresPrescription: false,
      description: 'Sugar-free dry cough syrup relief formulation.'
    }
  });

  console.log('✓ Medicines created');

  // 5. Seed Batches (Fresh, Near Expiry < 30 days, and Low stock)
  const now = new Date();
  const future1Year = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const future18Months = new Date(now.getTime() + 540 * 24 * 60 * 60 * 1000);
  const nearExpiry20Days = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000); // Near Expiry alert!
  const pastExpired = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // Expired alert!

  await prisma.batch.createMany({
    data: [
      {
        medicineId: paracetamol.id,
        batchNumber: 'DOL-2024-B1',
        expiryDate: future18Months,
        manufacturingDate: new Date('2024-01-10'),
        costPrice: 22.0,
        sellingPrice: 32.5,
        initialQuantity: 200,
        quantityInStock: 180
      },
      {
        medicineId: paracetamol.id,
        batchNumber: 'DOL-2023-EXP',
        expiryDate: nearExpiry20Days, // Expires soon
        manufacturingDate: new Date('2023-04-05'),
        costPrice: 20.0,
        sellingPrice: 30.0,
        initialQuantity: 50,
        quantityInStock: 12
      },
      {
        medicineId: amoxicillin.id,
        batchNumber: 'AUG-2024-01',
        expiryDate: future1Year,
        manufacturingDate: new Date('2024-02-15'),
        costPrice: 135.0,
        sellingPrice: 185.0,
        initialQuantity: 60,
        quantityInStock: 45
      },
      {
        medicineId: amoxicillin.id,
        batchNumber: 'AUG-2023-OLD',
        expiryDate: pastExpired, // Expired batch demo
        manufacturingDate: new Date('2023-01-15'),
        costPrice: 120.0,
        sellingPrice: 175.0,
        initialQuantity: 30,
        quantityInStock: 5,
        isRecalled: true
      },
      {
        medicineId: cetirizine.id,
        batchNumber: 'CET-2024-A',
        expiryDate: future18Months,
        manufacturingDate: new Date('2024-03-01'),
        costPrice: 15.0,
        sellingPrice: 28.0,
        initialQuantity: 100,
        quantityInStock: 8 // Low stock alert! (threshold is 15)
      },
      {
        medicineId: pantocid.id,
        batchNumber: 'PAN-2024-99',
        expiryDate: future1Year,
        manufacturingDate: new Date('2024-02-01'),
        costPrice: 85.0,
        sellingPrice: 125.0,
        initialQuantity: 100,
        quantityInStock: 80
      },
      {
        medicineId: azithromycin.id,
        batchNumber: 'AZI-2024-02',
        expiryDate: future1Year,
        manufacturingDate: new Date('2024-01-20'),
        costPrice: 95.0,
        sellingPrice: 140.0,
        initialQuantity: 40,
        quantityInStock: 30
      },
      {
        medicineId: coughSyrup.id,
        batchNumber: 'ASC-2024-S1',
        expiryDate: future18Months,
        manufacturingDate: new Date('2024-02-10'),
        costPrice: 70.0,
        sellingPrice: 105.0,
        initialQuantity: 50,
        quantityInStock: 42
      }
    ]
  });

  console.log('✓ Batches created (with realistic FIFO, near-expiry, and low stock items)');

  // 6. Seed a Prescription for Priya Sundaram
  const rx = await prisma.prescription.create({
    data: {
      prescriptionCode: 'RX-2026-001',
      customerId: customer2.id,
      doctorName: 'Dr. Arvind Swamy (MD, Pulmonology)',
      doctorLicense: 'KMC-84920',
      clinicHospital: 'Apollo City Clinic, Indiranagar',
      status: 'PENDING',
      notes: 'Take medicines after food. Drink plenty of warm water.',
      items: {
        create: [
          {
            medicineId: amoxicillin.id,
            dosageInstructions: '1 tablet twice daily after meals',
            quantityRequired: 10,
            quantityDispensed: 0
          },
          {
            medicineId: coughSyrup.id,
            dosageInstructions: '10ml thrice daily after food',
            quantityRequired: 1,
            quantityDispensed: 0
          }
        ]
      }
    }
  });

  console.log('✓ Prescription sample created:', rx.prescriptionCode);

  console.log('--- PharmaFlow Seeding Complete! ---');
  console.log('Credentials:');
  console.log('  Admin:       admin@pharmaflow.com / admin123');
  console.log('  Pharmacist:  pharmacist@pharmaflow.com / password123');
  console.log('  Cashier:     cashier@pharmaflow.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

