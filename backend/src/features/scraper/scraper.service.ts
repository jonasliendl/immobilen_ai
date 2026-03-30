import type { FastifyBaseLogger } from 'fastify';
import type { Prisma } from '@prisma/client';
import { getDb } from '../../database/client';
import type {
  ScraperInterface,
  ScrapeContext,
  ScraperJobResult,
  StandardListing,
} from './scraper.types';
import { processListingAlerts } from '../matcher/listing-matcher.service';
import { syncListingVerdict } from '../mietpreisbremse/mietpreisbremse-sync.service';

interface ListingAlertCandidate {
  id: string;
  title: string;
  listingUrl: string;
  coldRentAmount: number | null;
  warmRentAmount: number | null;
  rooms: number | null;
  areaM2: number | null;
  address: string | null;
  isWBSRequired: boolean | null;
}

function toInputJson(data: Record<string, unknown>): Prisma.InputJsonObject {
  return data as Prisma.InputJsonObject;
}

async function upsertListings(
  listings: StandardListing[],
): Promise<{ upsertedCount: number; newListings: ListingAlertCandidate[] }> {
  const db = getDb();
  let upsertedCount = 0;
  const newListings: ListingAlertCandidate[] = [];

  for (const listing of listings) {
    const existing = await db.listing.findUnique({
      where: {
        source_sourceListingId: {
          source: listing.source,
          sourceListingId: listing.sourceListingId,
        },
      },
      select: { id: true },
    });

    const saved = await db.listing.upsert({
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

    upsertedCount++;
    // Recompute persisted Mietpreisbremse verdict for the upserted listing
    await syncListingVerdict(saved);
    if (existing === null) {
      newListings.push({
        id: saved.id,
        title: saved.title,
        listingUrl: saved.listingUrl,
        coldRentAmount: saved.coldRentAmount === null ? null : Number(saved.coldRentAmount),
        warmRentAmount: saved.warmRentAmount === null ? null : Number(saved.warmRentAmount),
        rooms: saved.rooms === null ? null : Number(saved.rooms),
        areaM2: saved.areaM2 === null ? null : Number(saved.areaM2),
        address: saved.address,
        isWBSRequired: saved.isWBSRequired,
      });
    }
  }

  return { upsertedCount, newListings };
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
  let listingAlerts = {
    newListings: 0,
    matchedTenants: 0,
    channelsCreated: 0,
    channelsSent: 0,
    channelsFailed: 0,
    channelsSkippedDuplicate: 0,
  };
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

    const upsertResult = await upsertListings(validListings);
    listingsUpserted = upsertResult.upsertedCount;

    try {
      listingAlerts = await processListingAlerts(upsertResult.newListings, logger);
      logger.info(
        {
          sourceId: scraper.sourceId,
          newListings: listingAlerts.newListings,
          matchedTenants: listingAlerts.matchedTenants,
          channelsCreated: listingAlerts.channelsCreated,
          channelsSent: listingAlerts.channelsSent,
          channelsFailed: listingAlerts.channelsFailed,
          channelsSkippedDuplicate: listingAlerts.channelsSkippedDuplicate,
        },
        'Listing alert summary',
      );
    } catch (matcherError: unknown) {
      logger.error({ sourceId: scraper.sourceId, error: matcherError }, 'Listing alert processing failed');
    }

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
    listingAlerts,
    errorMessage,
    startedAt: job.startedAt,
    finishedAt: new Date(),
  };
}
