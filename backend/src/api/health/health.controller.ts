import type { FastifyReply, FastifyRequest } from 'fastify';
import { checkHealth } from '../../features/health/health.service';

export async function getHealthHandler(_req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const status = checkHealth();
  await reply.send(status);
}
