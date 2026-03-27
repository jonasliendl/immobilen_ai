import type { FastifyBaseLogger } from 'fastify';
import type { Prisma } from '@prisma/client';
import { getDb } from '../../database/client';
import type {
  ScraperInterface,
  ScrapeContext,
  ScraperJobResult,
  StandardListing,
} from './scraper.types';

function toInputJson(data: Record<string, unknown>): Prisma.InputJsonObject {
  return data as Prisma.InputJsonObject;
}

async function upsertListings(listings: StandardListing[]): Promise<number> {
  const db = getDb();
  let count = 0;

  for (const listing of listings) {
    await db.listing.upsert({
      where: {
        source_sourceListingId: {
          source: listing.source,
          sourceListingId: listing.sourceListingId,
        },
      },
      update: {
        title: listing.title,
        coldRentAmount: listing.coldRentAmount,
        warmRentAmount: listing.warmRentAmount,
        priceCurrency: listing.priceCurrency,
        freeFrom: listing.freeFrom,
        insertedAt: listing.insertedAt,
        isWBSRequired: listing.isWBSRequired,
        floor: listing.floor,
        maxFloor: listing.maxFloor,
        yearOfConstruction: listing.yearOfConstruction,
        heatingType: listing.heatingType,
        energyType: listing.energyType,
        energyEfficiencyClass: listing.energyEfficiencyClass,
        energyConsumptionKWhPerYear: listing.energyConsumptionKWhPerYear,
        address: listing.address,
        city: listing.city,
        country: listing.country,
        areaM2: listing.areaM2,
        rooms: listing.rooms,
        listingUrl: listing.listingUrl,
        imageUrls: listing.imageUrls,
        features: listing.features,
        rawData: toInputJson(listing.rawData),
      },
      create: {
        source: listing.source,
        sourceListingId: listing.sourceListingId,
        title: listing.title,
        coldRentAmount: listing.coldRentAmount,
        warmRentAmount: listing.warmRentAmount,
        priceCurrency: listing.priceCurrency,
        freeFrom: listing.freeFrom,
        insertedAt: listing.insertedAt,
        isWBSRequired: listing.isWBSRequired,
        floor: listing.floor,
        maxFloor: listing.maxFloor,
        yearOfConstruction: listing.yearOfConstruction,
        heatingType: listing.heatingType,
        energyType: listing.energyType,
        energyEfficiencyClass: listing.energyEfficiencyClass,
        energyConsumptionKWhPerYear: listing.energyConsumptionKWhPerYear,
        address: listing.address,
        city: listing.city,
        country: listing.country,
        areaM2: listing.areaM2,
        rooms: listing.rooms,
        listingUrl: listing.listingUrl,
        imageUrls: listing.imageUrls,
        features: listing.features,
        rawData: toInputJson(listing.rawData),
      },
    });
    count++;
  }

  return count;
}

export async function runScraper(
  scraper: ScraperInterface,
  logger: FastifyBaseLogger,
): Promise<ScraperJobResult> {
  const db = getDb();

  const job = await db.scraperJob.create({
    data: {
      sourceId: scraper.sourceId,
      status: 'RUNNING',
    },
  });

  const context: ScrapeContext = { logger };
  let listingsProcessed = 0;
  let listingsUpserted = 0;
  let errorMessage: string | null = null;

  try {
    if (scraper.initialize !== undefined) {
      await scraper.initialize();
    }

    const rawListings = await scraper.scrape(context);
    listingsProcessed = rawListings.length;

    const validListings = rawListings
      .map((raw) => scraper.transform(raw))
      .filter((listing) => scraper.validate(listing));

    listingsUpserted = await upsertListings(validListings);

    await db.scraperJob.update({
      where: { id: job.id },
      data: {
        status: 'SUCCESS',
        finishedAt: new Date(),
        listingsProcessed,
        listingsUpserted,
      },
    });
  } catch (error: unknown) {
    errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ sourceId: scraper.sourceId, error }, 'Scraper run failed');

    await db.scraperJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        listingsProcessed,
        listingsUpserted,
        errorMessage,
      },
    });
  } finally {
    if (scraper.cleanup !== undefined) {
      try {
        await scraper.cleanup();
      } catch (cleanupError: unknown) {
        logger.error({ sourceId: scraper.sourceId, error: cleanupError }, 'Scraper cleanup failed');
      }
    }
  }

  return {
    jobId: job.id,
    sourceId: scraper.sourceId,
    status: errorMessage === null ? 'SUCCESS' : 'FAILED',
    listingsProcessed,
    listingsUpserted,
    errorMessage,
    startedAt: job.startedAt,
    finishedAt: new Date(),
  };
}
