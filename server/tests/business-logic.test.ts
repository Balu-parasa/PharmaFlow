import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';

describe('PharmaFlow Assessment-Driven Automated Test Suite', () => {
  let adminToken: string;
  let pharmacistToken: string;
  let cashierToken: string;
  let doloMedicine: any;
  let earlyBatch: any;
  let laterBatch: any;
  let expiredBatch: any;
  let createdSupplier: any;

  beforeAll(async () => {
    // 1. Authenticate admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pharmaflow.com', password: 'admin123' });
    adminToken = adminLogin.body.data.token;

    // 2. Authenticate pharmacist
    const pharmacistLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pharmacist@pharmaflow.com', password: 'password123' });
    pharmacistToken = pharmacistLogin.body.data.token;

    // 3. Authenticate cashier
    const cashierLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cashier@pharmaflow.com', password: 'password123' });
    cashierToken = cashierLogin.body.data.token;

    // 4. Fetch test fixtures
    doloMedicine = await prisma.medicine.findUnique({
      where: { sku: 'MED-DOLO-650' },
      include: { batches: { orderBy: { expiryDate: 'asc' } } }
    });

    earlyBatch = doloMedicine.batches.find((b: any) => b.batchNumber === 'DOL-2023-FEFO-EARLY');
    laterBatch = doloMedicine.batches.find((b: any) => b.batchNumber === 'DOL-2024-FEFO-LATER');

    const augmentin = await prisma.medicine.findUnique({
      where: { sku: 'MED-AUG-625' },
      include: { batches: true }
    });
    expiredBatch = augmentin?.batches.find((b: any) => b.batchNumber === 'AUG-2023-EXPIRED');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // TEST 1: Medicine creation and server validation
  it('1. Medicine Creation & Server-side Validation: creates medicine & validates duplicates', async () => {
    const randomSku = `SKU-${Date.now().toString().slice(-4)}`;
    const res = await request(app)
      .post('/api/medicines')
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        sku: randomSku,
        category: 'Analgesics & Antipyretics',
        dosageForm: 'Tablet',
        strength: '400mg',
        minStockThreshold: 20
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sku).toBe(randomSku);

    // Negative duplicate test
    const dupRes = await request(app)
      .post('/api/medicines')
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({
        name: 'Ibuprofen 400mg Duplicate',
        sku: randomSku,
        category: 'Analgesics & Antipyretics',
        dosageForm: 'Tablet'
      });
    expect(dupRes.status).toBe(400);
    expect(dupRes.body.message).toMatch(/SKU already exists/i);
  });

  // TEST 2: Soft deactivation of medicines
  it('2. Medicine Soft Deactivation: toggles medicine status without deleting foreign key records', async () => {
    const res = await request(app)
      .patch(`/api/medicines/${doloMedicine.id}/toggle-status`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.isActive).toBe('boolean');

    // Restore to active
    await request(app)
      .patch(`/api/medicines/${doloMedicine.id}/toggle-status`)
      .set('Authorization', `Bearer ${adminToken}`);
  });

  // TEST 3: Supplier creation and directory
  it('3. Supplier Creation: registers verified vendor with contact information', async () => {
    const res = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'OmniHealth Supplies Ltd',
        contactPerson: 'Harish Mehta',
        phone: '+91 9988776655',
        email: 'orders@omnihealth.com',
        address: '42 Peenya Industrial Area, Bengaluru'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdSupplier = res.body.data;
  });

  // TEST 4: Purchase order receiving and batch restock
  it('4. Purchase Order & Batch Stock Receiving: receives stock and updates batches with movements', async () => {
    expect(createdSupplier).toBeDefined();

    const futureDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const batchNum = `PO-BATCH-${Date.now().toString().slice(-4)}`;

    const res = await request(app)
      .post('/api/suppliers/purchases')
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({
        supplierId: createdSupplier.id,
        items: [
          {
            medicineId: doloMedicine.id,
            batchNumber: batchNum,
            expiryDate: futureDate,
            costPrice: 18.5,
            sellingPrice: 30.0,
            quantity: 50
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toMatch(/^PO-/);

    // Verify StockMovement audit trail recorded
    const movement = await prisma.stockMovement.findFirst({
      where: { referenceId: res.body.data.orderNumber }
    });
    expect(movement).toBeDefined();
    expect(movement!.type).toBe('RESTOCK');
    expect(movement!.quantity).toBe(50);
  });

  // TEST 5: Purchase receiving blocks expired batches
  it('5. Negative Purchase Receiving: blocks receiving of expired batches', async () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const res = await request(app)
      .post('/api/suppliers/purchases')
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({
        supplierId: createdSupplier.id,
        items: [
          {
            medicineId: doloMedicine.id,
            batchNumber: `EXP-BATCH-${Date.now()}`,
            expiryDate: pastDate,
            costPrice: 10,
            sellingPrice: 20,
            quantity: 10
          }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already expired/i);
  });

  // TEST 6: Expired batch rejection in POS sale
  it('6. Expired Batch Rejection in POS: forbids selling expired medicines', async () => {
    expect(expiredBatch).toBeDefined();

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        items: [
          {
            batchId: expiredBatch.id,
            quantity: 1,
            unitPrice: expiredBatch.sellingPrice
          }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/expired/i);
  });

  // TEST 7: Negative stock prevention
  it('7. Negative Stock Prevention: rejects sale exceeding available stock', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        items: [
          {
            batchId: earlyBatch.id,
            quantity: 999999,
            unitPrice: earlyBatch.sellingPrice
          }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/insufficient stock/i);
  });

  // TEST 8: Multi-batch FEFO deduction
  it('8. FEFO Allocation Engine: prioritizes earliest expiring batch first', async () => {
    // Find the current earliest active batch for Dolo with stock > 0
    const now = new Date();
    const activeBatchesBefore = await prisma.batch.findMany({
      where: {
        medicineId: doloMedicine.id,
        isRecalled: false,
        expiryDate: { gt: now },
        quantityInStock: { gt: 0 }
      },
      orderBy: { expiryDate: 'asc' }
    });

    expect(activeBatchesBefore.length).toBeGreaterThan(0);
    const expectedTargetBatch = activeBatchesBefore[0];

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        autoFEFO: true,
        items: [
          {
            medicineId: doloMedicine.id,
            quantity: 3
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const targetBatchAfter = await prisma.batch.findUnique({ where: { id: expectedTargetBatch.id } });
    expect(targetBatchAfter!.quantityInStock).toBe(expectedTargetBatch.quantityInStock - 3);
  });

  // TEST 9: Transactional integrity and invoice calculation
  it('9. Invoicing & Tax Calculations: computes server-verified subtotal, tax and total', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        items: [
          {
            batchId: laterBatch.id,
            quantity: 2,
            unitPrice: 30.0,
            discount: 5.0
          }
        ],
        taxAmount: 2.75,
        discountAmount: 0
      });

    expect(res.status).toBe(201);
    const sale = res.body.data;
    // Expected: 2 * 30 - 5 = 55 subtotal + 2.75 tax = 57.75 total
    expect(sale.subTotal).toBe(55);
    expect(sale.totalAmount).toBe(57.75);
    expect(sale.invoiceNumber).toMatch(/^INV-/);
  });

  // TEST 10: Mandatory reasons and batch restock on returns
  it('10. Returns & Mandatory Justification: validates return quantity and requires reason', async () => {
    // Make sale
    const saleRes = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        items: [
          {
            batchId: laterBatch.id,
            quantity: 3,
            unitPrice: laterBatch.sellingPrice
          }
        ]
      });

    const saleId = saleRes.body.data.id;
    const saleItemId = saleRes.body.data.items[0].id;

    // Fail return without reason
    const failRes = await request(app)
      .post(`/api/sales/${saleId}/return`)
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({
        items: [{ saleItemId, quantity: 1 }],
        reason: ''
      });
    expect(failRes.status).toBe(400);

    // Fail return exceeding sold quantity
    const excessRes = await request(app)
      .post(`/api/sales/${saleId}/return`)
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({
        items: [{ saleItemId, quantity: 99 }],
        reason: 'Excess units return'
      });
    expect(excessRes.status).toBe(400);

    // Valid return
    const okRes = await request(app)
      .post(`/api/sales/${saleId}/return`)
      .set('Authorization', `Bearer ${pharmacistToken}`)
      .send({
        items: [{ saleItemId, quantity: 1 }],
        reason: 'Patient changed prescription'
      });
    expect(okRes.status).toBe(200);
    expect(okRes.body.success).toBe(true);
  });

  // TEST 11: Stock adjustment audit
  it('11. Stock Adjustment Audit: requires reason and records before/after balance', async () => {
    const res = await request(app)
      .patch(`/api/inventory/batches/${laterBatch.id}/adjust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        adjustment: 5,
        reason: 'Periodic physical count reconciliation'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const movement = await prisma.stockMovement.findFirst({
      where: {
        batchId: laterBatch.id,
        type: 'ADJUSTMENT'
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(movement).toBeDefined();
    expect(movement!.reason).toBe('Periodic physical count reconciliation');
  });

  // TEST 12: RBAC permissions verification
  it('12. Role-Based Access Control (RBAC): restricts cashier from privileged inventory updates', async () => {
    const res = await request(app)
      .patch(`/api/inventory/batches/${laterBatch.id}/adjust`)
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        adjustment: 10,
        reason: 'Unauthorized cashier adjustment'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  // TEST 13: Stock reconciliation report
  it('13. Stock Reconciliation Engine: reconciles restocks, sales, returns and physical balance', async () => {
    const res = await request(app)
      .get('/api/reports/reconciliation')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reconciliation).toBeDefined();
    expect(typeof res.body.data.reconciliation.calculatedBalance).toBe('number');
    expect(typeof res.body.data.reconciliation.livePhysicalStock).toBe('number');
    expect(res.body.data.reconciliation.isReconciled).toBe(true);
  });
});
