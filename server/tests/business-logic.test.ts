import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';

describe('PharmaFlow Critical Business Logic & FEFO Tests', () => {
  let adminToken: string;
  let cashierToken: string;
  let doloMedicine: any;
  let earlyBatch: any;
  let laterBatch: any;
  let expiredBatch: any;

  beforeAll(async () => {
    // 1. Authenticate admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pharmaflow.com', password: 'admin123' });
    adminToken = adminLogin.body.data.token;

    // 2. Authenticate cashier
    const cashierLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cashier@pharmaflow.com', password: 'password123' });
    cashierToken = cashierLogin.body.data.token;

    // 3. Find test medicine & batches from seed
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

  // TEST 1: Block Expired Batch Sale
  it('CRITICAL 1: Blocks sale of expired batches with explicit policy error', async () => {
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

  // TEST 2: Prevent Negative Stock (Insufficient quantity)
  it('CRITICAL 2: Prevents negative stock when requested quantity exceeds available stock', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        items: [
          {
            batchId: earlyBatch.id,
            quantity: 999999, // Way higher than available
            unitPrice: earlyBatch.sellingPrice
          }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/insufficient stock/i);
  });

  // TEST 3: FEFO Deduction Verification
  it('CRITICAL 3: Deducts earliest expiring batch first when autoFEFO is used', async () => {
    const preEarly = await prisma.batch.findUnique({ where: { id: earlyBatch.id } });
    const preLater = await prisma.batch.findUnique({ where: { id: laterBatch.id } });
    const earlyInitialQty = preEarly!.quantityInStock;
    const laterInitialQty = preLater!.quantityInStock;

    // Request 5 units using autoFEFO
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        autoFEFO: true,
        items: [
          {
            medicineId: doloMedicine.id,
            quantity: 5
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.invoiceNumber).toBeDefined();

    // Verify early batch was deducted, later batch remained untouched
    const postEarly = await prisma.batch.findUnique({ where: { id: earlyBatch.id } });
    const postLater = await prisma.batch.findUnique({ where: { id: laterBatch.id } });

    expect(postEarly!.quantityInStock).toBe(earlyInitialQty - 5);
    expect(postLater!.quantityInStock).toBe(laterInitialQty);

    // Verify StockMovement audit entry was created
    const movement = await prisma.stockMovement.findFirst({
      where: {
        batchId: earlyBatch.id,
        type: 'SALE'
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(movement).toBeDefined();
    expect(movement!.quantity).toBe(-5);
  });

  // TEST 4: Stock Adjustment Requires Reason and Updates Audit Trail
  it('CRITICAL 4: Requires reason for stock adjustment and updates StockMovement', async () => {
    // 4a: Without reason -> should fail
    const failRes = await request(app)
      .patch(`/api/inventory/batches/${laterBatch.id}/adjust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        adjustment: 10,
        reason: '' // empty reason
      });

    expect(failRes.status).toBe(400);
    expect(failRes.body.message).toMatch(/reason is required/i);

    // 4b: With reason -> should succeed
    const okRes = await request(app)
      .patch(`/api/inventory/batches/${laterBatch.id}/adjust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        adjustment: 5,
        reason: 'Audit physical count reconciliation'
      });

    expect(okRes.status).toBe(200);
    expect(okRes.body.success).toBe(true);

    const movement = await prisma.stockMovement.findFirst({
      where: {
        batchId: laterBatch.id,
        type: 'ADJUSTMENT'
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(movement).toBeDefined();
    expect(movement!.reason).toBe('Audit physical count reconciliation');
  });

  // TEST 5: Sales Return Process Restocks Inventory and Enforces Reason
  it('CRITICAL 5: Enforces reason on return and accurately restocks batch', async () => {
    // First, make a sale of 2 items
    const saleRes = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        items: [
          {
            batchId: laterBatch.id,
            quantity: 2,
            unitPrice: laterBatch.sellingPrice
          }
        ]
      });

    expect(saleRes.status).toBe(201);
    const saleId = saleRes.body.data.id;
    const saleItemId = saleRes.body.data.items[0].id;

    const preReturnBatch = await prisma.batch.findUnique({ where: { id: laterBatch.id } });

    // Try return without reason -> should fail
    const failReturn = await request(app)
      .post(`/api/sales/${saleId}/return`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [{ saleItemId, quantity: 1 }],
        reason: ''
      });

    expect(failReturn.status).toBe(400);
    expect(failReturn.body.message).toMatch(/reason is required/i);

    // Valid return
    const okReturn = await request(app)
      .post(`/api/sales/${saleId}/return`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [{ saleItemId, quantity: 1 }],
        reason: 'Customer bought excess units by mistake'
      });

    expect(okReturn.status).toBe(200);
    expect(okReturn.body.success).toBe(true);

    // Batch should have incremented by 1
    const postReturnBatch = await prisma.batch.findUnique({ where: { id: laterBatch.id } });
    expect(postReturnBatch!.quantityInStock).toBe(preReturnBatch!.quantityInStock + 1);

    // Check return stock movement
    const retMovement = await prisma.stockMovement.findFirst({
      where: {
        batchId: laterBatch.id,
        type: 'RETURN'
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(retMovement).toBeDefined();
    expect(retMovement!.quantity).toBe(1);
    expect(retMovement!.reason).toContain('Customer bought excess units');
  });

  // TEST 6: RBAC Authorization Verification
  it('CRITICAL 6: Restricts privileged operations (like stock adjustment) from Cashier', async () => {
    const res = await request(app)
      .patch(`/api/inventory/batches/${laterBatch.id}/adjust`)
      .set('Authorization', `Bearer ${cashierToken}`) // Cashier role
      .send({
        adjustment: 10,
        reason: 'Cashier trying to adjust stock'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden/i);
  });
});

