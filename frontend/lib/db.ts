import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | undefined;

export function getDb(): PrismaClient {
  if (prisma === undefined) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL is not set');
    const adapter = new PrismaPg({ connectionString });
    prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    });
  }
  return prisma;
}
