import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  const deleted = await prisma.batch.deleteMany({
    where: { batchNumber: { in: ['BAT-EARLY-1794217570974', 'BAT-LATER-1794217570986'] } }
  });
  console.log('Deleted orphan batches:', deleted.count);
  await prisma.$disconnect();
}

clean().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
