import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { parseEnv } from '../shared/utils/index';

let prismaRo: PrismaClient | undefined;

export function getDbRo(): PrismaClient {
  if (prismaRo === undefined) {
    const adapter = new PrismaPg({ connectionString: parseEnv('DATABASE_URL_RO') });
    prismaRo = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    });
    process.on('beforeExit', () => {
      void prismaRo?.$disconnect();
    });
  }
  return prismaRo;
}
