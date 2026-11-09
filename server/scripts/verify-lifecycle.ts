import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runLifecycle() {
  console.log('=== REAL TRANSACTION LIFECYCLE AUDIT ===');

  // 1. Supplier
  let supplier = await prisma.supplier.findFirst({ where: { name: 'E2E Pharma Supply Co' } });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        name: 'E2E Pharma Supply Co',
        email: 'e2e@pharmasupply.com',
        phone: '9876543210',
        address: 'Bangalore, India'
      }
    });
  }
  console.log('1. Supplier verified:', supplier.name, 'ID:', supplier.id);

  // 2. Medicine
  const sku = 'E2E-TEST-' + Date.now();
  const medicine = await prisma.medicine.create({
    data: {
      name: 'Amoxicillin Trihydrate E2E',
      genericName: 'Amoxicillin',
      sku: sku,
      category: 'Antibiotics',
      dosageForm: 'Capsule',
      strength: '500mg',
      minStockThreshold: 10,
      requiresPrescription: false
    }
  });
  console.log('2. Medicine Created:', medicine.name, 'SKU:', medicine.sku, 'ID:', medicine.id);

  // 3. Purchase Receiving with Purchase Order & 2 Batches
  const poNumber = 'PO-E2E-' + Date.now();
  const po = await prisma.purchaseOrder.create({
    data: {
      orderNumber: poNumber,
      supplierId: supplier.id,
      totalAmount: 20 * 28.0 + 30 * 30.0,
      status: 'RECEIVED'
    }
  });

  const b1Expiry = new Date(Date.now() + 30 * 86400000); // 30 days ahead
  const b2Expiry = new Date(Date.now() + 180 * 86400000); // 180 days ahead

  const batch1 = await prisma.batch.create({
    data: {
      medicineId: medicine.id,
      purchaseOrderId: po.id,
      batchNumber: 'BAT-EARLY-' + Date.now(),
      expiryDate: b1Expiry,
      initialQuantity: 20,
      quantityInStock: 20,
      costPrice: 28.0,
      sellingPrice: 48.0
    }
  });

  const batch2 = await prisma.batch.create({
    data: {
      medicineId: medicine.id,
      purchaseOrderId: po.id,
      batchNumber: 'BAT-LATER-' + Date.now(),
      expiryDate: b2Expiry,
      initialQuantity: 30,
      quantityInStock: 30,
      costPrice: 30.0,
      sellingPrice: 50.0
    }
  });

  await prisma.stockMovement.createMany({
    data: [
      { batchId: batch1.id, type: 'RESTOCK', quantity: 20, balanceAfter: 20, reason: 'PO: ' + po.orderNumber, referenceId: po.orderNumber },
      { batchId: batch2.id, type: 'RESTOCK', quantity: 30, balanceAfter: 30, reason: 'PO: ' + po.orderNumber, referenceId: po.orderNumber }
    ]
  });

  console.log('3. Purchase Order & Batches Received:');
  console.log('   PO:', po.orderNumber, 'Total Amount: ₹' + po.totalAmount);
  console.log('   - Batch 1 (Early expiry):', batch1.batchNumber, 'Qty:', batch1.quantityInStock, 'Price: ₹' + batch1.sellingPrice, 'Exp:', batch1.expiryDate.toISOString());
  console.log('   - Batch 2 (Later expiry):', batch2.batchNumber, 'Qty:', batch2.quantityInStock, 'Price: ₹' + batch2.sellingPrice, 'Exp:', batch2.expiryDate.toISOString());

  // 4. Multi-batch FEFO Sale: Request 25 units
  console.log('4. Performing FEFO Sale for 25 units...');
  const eligibleBatches = await prisma.batch.findMany({
    where: { medicineId: medicine.id, quantityInStock: { gt: 0 }, expiryDate: { gt: new Date() } },
    orderBy: { expiryDate: 'asc' }
  });

  let remaining = 25;
  const allocations: { batchId: string; batchNumber: string; quantity: number; unitPrice: number }[] = [];
  for (const b of eligibleBatches) {
    if (remaining <= 0) break;
    const qty = Math.min(b.quantityInStock, remaining);
    allocations.push({ batchId: b.id, batchNumber: b.batchNumber, quantity: qty, unitPrice: b.sellingPrice });
    remaining -= qty;
  }
  console.log('   FEFO Allocation Plan:', allocations);

  const user = await prisma.user.findFirst();
  const subTotal = allocations.reduce((s, a) => s + a.quantity * a.unitPrice, 0);
  const taxAmount = Math.round(subTotal * 0.05 * 100) / 100;
  const totalAmount = Math.round((subTotal + taxAmount) * 100) / 100;

  const sale = await prisma.$transaction(async (tx) => {
    const s = await tx.sale.create({
      data: {
        invoiceNumber: 'INV-E2E-' + Date.now(),
        cashierId: user!.id,
        subTotal,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        items: {
          create: allocations.map((a) => ({
            batchId: a.batchId,
            quantity: a.quantity,
            unitPrice: a.unitPrice,
            totalPrice: a.quantity * a.unitPrice
          }))
        }
      },
      include: { items: true }
    });

    for (const a of allocations) {
      const updated = await tx.batch.update({
        where: { id: a.batchId },
        data: { quantityInStock: { decrement: a.quantity } }
      });
      await tx.stockMovement.create({
        data: {
          batchId: a.batchId,
          userId: user!.id,
          type: 'SALE',
          quantity: -a.quantity,
          balanceAfter: updated.quantityInStock,
          reason: 'Invoice Checkout ' + s.invoiceNumber,
          referenceId: s.invoiceNumber
        }
      });
    }

    await tx.auditLog.create({
      data: {
        userId: user!.id,
        action: 'SALE_COMPLETED',
        entity: 'Sale',
        entityId: s.id,
        details: JSON.stringify({ invoiceNumber: s.invoiceNumber, totalAmount: s.totalAmount, items: s.items.length })
      }
    });

    return s;
  });

  console.log('5. Sale Completed: Invoice', sale.invoiceNumber, 'Subtotal: ₹' + sale.subTotal, 'Tax: ₹' + sale.taxAmount, 'Grand Total: ₹' + sale.totalAmount);
  const b1PostSale = await prisma.batch.findUnique({ where: { id: batch1.id } });
  const b2PostSale = await prisma.batch.findUnique({ where: { id: batch2.id } });
  console.log('   Post-Sale Batches:');
  console.log('   - Batch 1 (Early, was 20):', b1PostSale?.quantityInStock, '(Expected 0)');
  console.log('   - Batch 2 (Later, was 30):', b2PostSale?.quantityInStock, '(Expected 25)');

  // 6. Partial Return of 3 units
  console.log('6. Processing Partial Return of 3 units from Batch 2...');
  const saleItem2 = sale.items.find((i) => i.batchId === batch2.id)!;
  const returnMovement = await prisma.$transaction(async (tx) => {
    const updated = await tx.batch.update({
      where: { id: batch2.id },
      data: { quantityInStock: { increment: 3 } }
    });
    const sm = await tx.stockMovement.create({
      data: {
        batchId: batch2.id,
        userId: user!.id,
        type: 'RETURN',
        quantity: 3,
        balanceAfter: updated.quantityInStock,
        reason: 'Patient return - unopened intact blister',
        referenceId: sale.invoiceNumber
      }
    });
    await tx.auditLog.create({
      data: {
        userId: user!.id,
        action: 'RETURN_PROCESSED',
        entity: 'Sale',
        entityId: sale.id,
        details: JSON.stringify({ invoiceNumber: sale.invoiceNumber, batchId: batch2.id, quantityReturned: 3 })
      }
    });
    return sm;
  });
  const b2PostReturn = await prisma.batch.findUnique({ where: { id: batch2.id } });
  console.log('   Return Completed: Restocked 3 units.');
  console.log('   - Batch 2 (was 25):', b2PostReturn?.quantityInStock, '(Expected 28)');

  // 7. Audit Trail and Ledger Inspection
  const movements = await prisma.stockMovement.findMany({
    where: { batchId: { in: [batch1.id, batch2.id] } },
    orderBy: { createdAt: 'asc' }
  });
  console.log('7. Stock Movement Ledger:');
  movements.forEach((m) => {
    console.log(`   [${m.createdAt.toISOString()}] ${m.type.padEnd(8)} Qty: ${m.quantity.toString().padStart(3)} | Balance: ${m.balanceAfter.toString().padStart(2)} | Reason: ${m.reason}`);
  });

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityId: sale.id },
    orderBy: { createdAt: 'asc' }
  });
  console.log('   Audit Logs for Sale:');
  auditLogs.forEach((a) => console.log(`   [${a.createdAt.toISOString()}] ${a.action} - ${a.details}`));

  // 8. Stock Reconciliation Formula
  // Formula: Restocks + Returns + Positive Adjustments - Sales - Negative Adjustments
  const restockQty = movements.filter((m) => m.type === 'RESTOCK').reduce((s, m) => s + m.quantity, 0);
  const saleQty = Math.abs(movements.filter((m) => m.type === 'SALE').reduce((s, m) => s + m.quantity, 0));
  const returnQty = movements.filter((m) => m.type === 'RETURN').reduce((s, m) => s + m.quantity, 0);
  const calculatedBalance = restockQty - saleQty + returnQty;
  const livePhysicalTotal = (b1PostSale?.quantityInStock || 0) + (b2PostReturn?.quantityInStock || 0);

  console.log('8. Mathematical Reconciliation:');
  console.log('   Restocks (+):', restockQty);
  console.log('   Sales (-):', saleQty);
  console.log('   Returns (+):', returnQty);
  console.log('   Calculated Balance:', calculatedBalance);
  console.log('   Physical Total:', livePhysicalTotal);
  console.log('   Reconciliation Result:', calculatedBalance === livePhysicalTotal ? 'VERIFIED MATCH (100% Correct)' : 'MISMATCH');
}

runLifecycle()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Lifecycle error:', e);
    prisma.$disconnect();
    process.exit(1);
  });
