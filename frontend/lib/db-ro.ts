import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

let prismaRo: PrismaClient | undefined;

export function getDbRo(): PrismaClient {
  if (prismaRo === undefined) {
    const connectionString = process.env.DATABASE_URL_RO ?? process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL or DATABASE_URL_RO is not set');
    const adapter = new PrismaPg({ connectionString });
    prismaRo = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    });
  }
  return prismaRo;
}
