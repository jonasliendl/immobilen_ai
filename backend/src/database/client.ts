import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { parseEnv } from '../shared/utils/index';

let prisma: PrismaClient | undefined;

export function getDb(): PrismaClient {
  if (prisma === undefined) {
    const adapter = new PrismaPg({ connectionString: parseEnv('DATABASE_URL') });
    prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    });
    process.on('beforeExit', () => {
      void prisma?.$disconnect();
    });
  }
  return prisma;
}
