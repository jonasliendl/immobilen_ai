import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getListingById, getListings } from '../../features/listings/listings.service';
import { ListingsQuerySchema } from '../../features/listings/listings.types';

export async function getListingsHandler(
  request: FastifyRequest<{ Querystring: Record<string, string | string[]> }>,
  reply: FastifyReply,
): Promise<void> {
  const parsed = ListingsQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    await reply.status(400).send({ error: z.treeifyError(parsed.error) });
    return;
  }

  const result = await getListings(parsed.data);

  await reply.send({
    data: result.data,
    meta: { page: result.page, limit: result.limit, total: result.total },
  });
}

export async function getListingByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const listing = await getListingById(request.params.id);

  if (listing === null) {
    await reply.status(404).send({ error: 'Listing not found' });
    return;
  }

  await reply.send({ data: listing });
}
