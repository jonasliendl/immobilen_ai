import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  createWaitlistSignup,
  getWaitlistStats,
  isValidEmailShape,
  normalizeEmail,
  recordQrOpen,
} from '../../features/waitlist/waitlist.service';
import { WaitlistSignupBodySchema } from '../../features/waitlist/waitlist.types';

export async function postWaitlistSignupHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = WaitlistSignupBodySchema.safeParse(request.body);

  if (!parsed.success) {
    await reply.status(400).send({ error: z.treeifyError(parsed.error) });
    return;
  }

  const email = normalizeEmail(parsed.data.email);
  if (!isValidEmailShape(email)) {
    await reply.status(400).send({ error: 'Invalid email' });
    return;
  }

  try {
    const { created } = await createWaitlistSignup({ ...parsed.data, email });
    await reply.send({ success: true, created });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_EMAIL') {
      await reply.status(400).send({ error: 'Invalid email' });
      return;
    }
    throw error;
  }
}

export async function postWaitlistQrOpenHandler(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await recordQrOpen();
  await reply.send({ success: true });
}

export async function getWaitlistStatsHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const secret = process.env.WAITLIST_ADMIN_SECRET;
  if (secret === undefined || secret.length === 0) {
    await reply.status(404).send({ error: 'Not found' });
    return;
  }

  const header = request.headers['x-waitlist-admin-secret'];
  const provided = typeof header === 'string' ? header : '';
  if (provided !== secret) {
    await reply.status(403).send({ error: 'Forbidden' });
    return;
  }

  const stats = await getWaitlistStats();
  await reply.send({ data: stats });
}
