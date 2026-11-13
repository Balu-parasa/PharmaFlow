import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

export default prisma;

