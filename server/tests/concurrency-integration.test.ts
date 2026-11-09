import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';

describe('PharmaFlow Critical Integration & Concurrency Test Suite', () => {
  let adminToken: string;
  let cashierToken: string;
  let testMedicine: any;
  let earlyBatch: any;
  let laterBatch: any;

  beforeAll(async () => {
    // 1. Authenticate admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pharmaflow.com', password: 'admin123' });
    adminToken = adminRes.body.data.token;

    // 2. Authenticate cashier
    const cashierRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cashier@pharmaflow.com', password: 'password123' });
    cashierToken = cashierRes.body.data.token;

    // 3. Create isolated medicine for integration verification
    const testSku = `MED-CONC-${Date.now()}`;
    const medRes = await request(app)
      .post('/api/medicines')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Concurrent Test Compound',
        genericName: 'Iso-Compound',
        sku: testSku,
        category: 'Analgesics',
        dosageForm: 'Tablet',
        strength: '250mg',
        minStockThreshold: 10
      });
    testMedicine = medRes.body.data;

    // 4. Ingest Supplier & 2 distinct batches with different expiries
    const supRes = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Supplier-${Date.now()}`,
        contactPerson: 'QA Lead',
        phone: `9899${Math.floor(100000 + Math.random() * 900000)}`
      });
    const supplierId = supRes.body.data.id;

    // Early batch expiring in 45 days, Later batch expiring in 365 days
    const in45d = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const in365d = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const poRes = await request(app)
      .post('/api/suppliers/purchases')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        supplierId,
        items: [
          {
            medicineId: testMedicine.id,
            batchNumber: `BATCH-EARLY-${Date.now().toString().slice(-4)}`,
            expiryDate: in45d,
            costPrice: 10,
            sellingPrice: 20,
            quantity: 30
          },
          {
            medicineId: testMedicine.id,
            batchNumber: `BATCH-LATER-${Date.now().toString().slice(-4)}`,
            expiryDate: in365d,
            costPrice: 10,
            sellingPrice: 20,
            quantity: 50
          }
        ]
      });
    expect(poRes.status).toBe(201);

    const createdBatches = await prisma.batch.findMany({
      where: { medicineId: testMedicine.id },
      orderBy: { expiryDate: 'asc' }
    });
    earlyBatch = createdBatches[0];
    laterBatch = createdBatches[1];
  });

  it('1. Checkout Idempotency: Replaying exact request returns identical sale without duplicate stock deduction', async () => {
    const key = `idemp-key-${Date.now()}`;
    const payload = {
      idempotencyKey: key,
      customerPhone: '9991112223',
      customerName: 'Test Idempotent Customer',
      items: [{ batchId: earlyBatch.id, quantity: 5, unitPrice: 20 }],
      paymentMethod: 'CASH'
    };

    // First checkout
    const firstRes = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send(payload);

    expect(firstRes.status).toBe(201);
    const firstInvoice = firstRes.body.data.invoiceNumber;
    expect(firstInvoice).toBeDefined();

    // Replay identical request with same key
    const replayRes = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send(payload);

    expect(replayRes.status).toBe(200);
    expect(replayRes.body.isIdempotentReplay).toBe(true);
    expect(replayRes.body.data.invoiceNumber).toBe(firstInvoice);

    // Verify batch was only deducted once (30 - 5 = 25)
    const checkBatch = await prisma.batch.findUnique({ where: { id: earlyBatch.id } });
    expect(checkBatch?.quantityInStock).toBe(25);
  });

  it('2. Checkout Idempotency: Reject reuse of key with different payload parameters', async () => {
    const conflictKey = `conflict-key-${Date.now()}`;

    // Original request
    await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        idempotencyKey: conflictKey,
        items: [{ batchId: earlyBatch.id, quantity: 2, unitPrice: 20 }],
        paymentMethod: 'CASH'
      });

    // Modified request with different quantity under same key
    const conflictRes = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        idempotencyKey: conflictKey,
        items: [{ batchId: earlyBatch.id, quantity: 10, unitPrice: 20 }],
        paymentMethod: 'CASH'
      });

    expect(conflictRes.status).toBe(422);
    expect(conflictRes.body.message).toContain('Idempotency conflict');
  });

  it('3. Multi-batch Auto-FEFO: Deducts earliest expiring batch completely before touching later batch', async () => {
    // Current earlyBatch stock = 23 (after 5 + 2 deducted in tests above)
    const currentEarly = await prisma.batch.findUnique({ where: { id: earlyBatch.id } });
    const earlyRemaining = currentEarly!.quantityInStock;

    // We request (earlyRemaining + 10) units using autoFEFO
    const requestedQty = earlyRemaining + 10;

    const fefoSaleRes = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        autoFEFO: true,
        items: [{ medicineId: testMedicine.id, quantity: requestedQty, discount: 0 }],
        paymentMethod: 'UPI'
      });

    expect(fefoSaleRes.status).toBe(201);
    expect(fefoSaleRes.body.data.items.length).toBe(2);

    // Verify early batch is fully exhausted to 0
    const earlyAfter = await prisma.batch.findUnique({ where: { id: earlyBatch.id } });
    expect(earlyAfter?.quantityInStock).toBe(0);

    // Verify later batch was deducted by exactly 10 (50 - 10 = 40)
    const laterAfter = await prisma.batch.findUnique({ where: { id: laterBatch.id } });
    expect(laterAfter?.quantityInStock).toBe(40);
  });

  it('4. Concurrency & Overselling Prevention: Concurrent transactions competing for same stock never result in negative stock', async () => {
    // laterBatch currently has 40 units
    // Launch 5 simultaneous requests each attempting to buy 15 units (Total requested: 75 > 40)
    const promises = Array.from({ length: 5 }).map((_, i) =>
      request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          items: [{ batchId: laterBatch.id, quantity: 15, unitPrice: 20 }],
          paymentMethod: 'CASH',
          notes: `Concurrent race test #${i + 1}`
        })
    );

    const results = await Promise.all(promises);

    const successful = results.filter((r) => r.status === 201);
    const rejected = results.filter((r) => r.status === 400);

    // At most 2 requests (15 * 2 = 30) can succeed from 40 units; 3rd requests 15 (needs 45) must fail
    expect(successful.length).toBe(2);
    expect(rejected.length).toBe(3);

    // Verify stock never went below zero (40 - 30 = 10 units left)
    const finalBatch = await prisma.batch.findUnique({ where: { id: laterBatch.id } });
    expect(finalBatch!.quantityInStock).toBe(10);
    expect(finalBatch!.quantityInStock).toBeGreaterThanOrEqual(0);
  });

  it('5. Regulatory Stock Reconciliation Formula holds 100% mathematically across all ledger events', async () => {
    const reconRes = await request(app)
      .get('/api/reports/reconciliation')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(reconRes.status).toBe(200);
    const rec = reconRes.body.data.reconciliation;

    // Verify math: Restocked - Sold + Returned + Adjusted == PhysicalStock
    const { totalRestocked, totalSold, totalReturned, totalAdjusted, calculatedBalance, livePhysicalStock, isReconciled } = rec;
    const computed = totalRestocked - totalSold + totalReturned + totalAdjusted;

    expect(calculatedBalance).toBe(computed);
    expect(livePhysicalStock).toBe(computed);
    expect(isReconciled).toBe(true);
  });
});
