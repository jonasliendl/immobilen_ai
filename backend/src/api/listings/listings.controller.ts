import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getListingById, getListings } from '../../features/listings/listings.service';
import {
  ListingsQuerySchema,
  MietpreisbremseQuerySchema,
} from '../../features/listings/listings.types';
import { calculateMietpreisbremseAssessment } from '../../features/mietpreisbremse/mietpreisbremse.service';
import { syncAllVerdicts } from '../../features/mietpreisbremse/mietpreisbremse-sync.service';

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

  if (parsed.data.includeMietpreisbremse) {
    const enrichedData = result.data.map((listing) => ({
      ...listing,
      mietpreisbremse:
        listing.mietpreisbremseVerdict === null
          ? null
          : {
            verdict: listing.mietpreisbremseVerdict,
            legalCapPerM2: listing.mietpreisbremseMaxLegalPerM2
              ? Number(listing.mietpreisbremseMaxLegalPerM2)
              : null,
            listingRentPerM2: listing.mietpreisbremseListingRentPerM2
              ? Number(listing.mietpreisbremseListingRentPerM2)
              : null,
            overpaymentPercent: listing.mietpreisbremseOverpaymentPercent
              ? Number(listing.mietpreisbremseOverpaymentPercent)
              : null,
          },
    }));

    await reply.send({
      data: enrichedData,
      meta: { page: result.page, limit: result.limit, total: result.total },
    });
    return;
  }

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

export async function getListingMietpreisbremseHandler(
  request: FastifyRequest<{
    Params: { id: string };
    Querystring: Record<string, string | string[]>;
  }>,
  reply: FastifyReply,
): Promise<void> {
  const parsed = MietpreisbremseQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    await reply.status(400).send({ error: z.treeifyError(parsed.error) });
    return;
  }

  const listing = await getListingById(request.params.id);
  if (listing === null) {
    await reply.status(404).send({ error: 'Listing not found' });
    return;
  }

  const assessment = calculateMietpreisbremseAssessment(listing, parsed.data);
  if (assessment === null) {
    await reply.status(422).send({
      error: 'Insufficient data for Mietpreisbremse check',
      hint: 'Provide areaM2, buildingYear, and rent (cold or warm) parameters if missing in listing.',
    });
    return;
  }

  await reply.send({ data: assessment });
}

export async function syncMietpreisbremseHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const result = await syncAllVerdicts();
  await reply.send({ data: result });
}
