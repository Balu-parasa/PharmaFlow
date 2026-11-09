import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugLedger() {
  const batches = await prisma.batch.findMany({
    select: { id: true, batchNumber: true, initialQuantity: true, quantityInStock: true }
  });
  const movements = await prisma.stockMovement.findMany({
    select: { id: true, batchId: true, type: true, quantity: true }
  });

  const liveStock = batches.reduce((s, b) => s + b.quantityInStock, 0);
  let restock = 0, sale = 0, ret = 0, adj = 0;
  for (const m of movements) {
    if (m.type === 'RESTOCK') restock += m.quantity;
    else if (m.type === 'SALE') sale += Math.abs(m.quantity);
    else if (m.type === 'RETURN') ret += m.quantity;
    else if (m.type === 'ADJUSTMENT') adj += m.quantity;
  }
  const calc = restock - sale + ret + adj;
  console.log('Live Physical Stock:', liveStock);
  console.log('Restock:', restock, 'Sale:', sale, 'Return:', ret, 'Adjust:', adj);
  console.log('Calculated Balance:', calc);
  console.log('Difference (Live - Calc):', liveStock - calc);

  for (const b of batches) {
    const bMovements = movements.filter((m) => m.batchId === b.id);
    let bRestock = 0, bSale = 0, bRet = 0, bAdj = 0;
    for (const m of bMovements) {
      if (m.type === 'RESTOCK') bRestock += m.quantity;
      else if (m.type === 'SALE') bSale += Math.abs(m.quantity);
      else if (m.type === 'RETURN') bRet += m.quantity;
      else if (m.type === 'ADJUSTMENT') bAdj += m.quantity;
    }
    const bCalc = bRestock - bSale + bRet + bAdj;
    if (bCalc !== b.quantityInStock) {
      console.log('Mismatch batch:', b.batchNumber, 'Live:', b.quantityInStock, 'Calc:', bCalc, 'Movements count:', bMovements.length);
    }
  }
}

debugLedger()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
