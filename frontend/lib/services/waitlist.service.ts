import { Prisma } from '@prisma/client';
import { getDb } from '../db';
import type { WaitlistSignupBody } from './waitlist.types';

const emailBasic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmailShape(email: string): boolean {
  return emailBasic.test(email);
}

export async function createWaitlistSignup(body: WaitlistSignupBody): Promise<{ created: boolean }> {
  const email = normalizeEmail(body.email);
  if (!isValidEmailShape(email)) {
    throw new Error('INVALID_EMAIL');
  }

  const db = getDb();
  try {
    await db.waitlistSignup.create({
      data: { email, source: body.source },
    });
    return { created: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { created: false };
    }
    throw error;
  }
}

export async function recordQrOpen(): Promise<void> {
  const db = getDb();
  await db.waitlistQrOpen.create({ data: {} });
}

export async function getWaitlistStats(): Promise<{
  signupsTotal: number;
  signupsBySource: Record<string, number>;
  qrOpensTotal: number;
}> {
  const db = getDb();
  const [signupsTotal, bySource, qrOpensTotal] = await Promise.all([
    db.waitlistSignup.count(),
    db.waitlistSignup.groupBy({
      by: ['source'],
      _count: { source: true },
    }),
    db.waitlistQrOpen.count(),
  ]);

  const signupsBySource: Record<string, number> = {};
  for (const row of bySource) {
    signupsBySource[row.source] = row._count.source;
  }

  return { signupsTotal, signupsBySource, qrOpensTotal };
}
