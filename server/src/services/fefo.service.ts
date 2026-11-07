import { PrismaClient } from '@prisma/client';

export interface FEFOAllocation {
  batchId: string;
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  unitPrice: number;
}

/**
 * Automatically allocates quantity for a medicine strictly following FEFO
 * (First Expiry, First Out).
 *
 * Rules:
 * 1. Exclude recalled batches.
 * 2. Exclude already expired batches (expiryDate <= now).
 * 3. Sort batches ascending by expiryDate (earliest expiry first).
 * 4. Fulfill requested quantity across available batches.
 * 5. If total available across valid batches is less than required, throw error.
 */
export async function allocateFEFOBatches(
  tx: any,
  medicineId: string,
  quantityRequired: number
): Promise<FEFOAllocation[]> {
  const now = new Date();

  // Find all active, non-recalled, non-expired batches with stock > 0, ordered by expiryDate ASC
  const batches = await tx.batch.findMany({
    where: {
      medicineId,
      isRecalled: false,
      expiryDate: { gt: now },
      quantityInStock: { gt: 0 }
    },
    orderBy: {
      expiryDate: 'asc' // FEFO: Earliest expiry date first
    }
  });

  const totalAvailable = batches.reduce((sum: number, b: any) => sum + b.quantityInStock, 0);
  if (totalAvailable < quantityRequired) {
    const med = await tx.medicine.findUnique({ where: { id: medicineId } });
    const medName = med ? med.name : medicineId;
    throw new Error(
      `Insufficient sellable stock for '${medName}'. Requested: ${quantityRequired}, Available (non-expired): ${totalAvailable}`
    );
  }

  let remainingToAllocate = quantityRequired;
  const allocations: FEFOAllocation[] = [];

  for (const b of batches) {
    if (remainingToAllocate <= 0) break;

    const takeQty = Math.min(b.quantityInStock, remainingToAllocate);
    allocations.push({
      batchId: b.id,
      batchNumber: b.batchNumber,
      expiryDate: b.expiryDate,
      quantity: takeQty,
      unitPrice: b.sellingPrice
    });

    remainingToAllocate -= takeQty;
  }

  return allocations;
}

