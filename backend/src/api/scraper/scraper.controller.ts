import type { FastifyReply, FastifyRequest } from 'fastify';
import { runScraper } from '../../features/scraper/scraper.service';
import { scraperRegistry } from '../../features/scraper/scraper.registry';
import type { ScraperJobResult } from '../../features/scraper/scraper.types';

export async function triggerScraperHandler(
  request: FastifyRequest<{ Params: { sourceId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { sourceId } = request.params;

  const scraper = scraperRegistry.find((s) => s.sourceId === sourceId);

  if (scraper === undefined) {
    await reply.status(404).send({ error: `Scraper '${sourceId}' not found` });
    return;
  }

  const result: ScraperJobResult = await runScraper(scraper, request.log);
  await reply.status(202).send(result);
}
