import type { FastifyBaseLogger } from 'fastify';

export interface ScrapeContext {
  readonly logger: FastifyBaseLogger;
  readonly signal?: AbortSignal;
}

export interface RawScrapedListing {
  readonly sourceListingId: string;
  readonly rawData: Record<string, unknown>;
}

export interface StandardListing {
  readonly source: string;
  readonly sourceListingId: string;
  readonly title: string;
  readonly priceAmount: number | null;
  readonly priceCurrency: string | null;
  readonly address: string | null;
  readonly city: string | null;
  readonly country: string | null;
  readonly areaM2: number | null;
  readonly rooms: number | null;
  readonly listingUrl: string;
  readonly imageUrls: string[];
  readonly rawData: Record<string, unknown>;
}

export interface ScraperInterface {
  readonly sourceId: string;
  readonly scheduleCron: string;
  initialize?(): Promise<void>;
  scrape(context: ScrapeContext): Promise<RawScrapedListing[]>;
  transform(raw: RawScrapedListing): StandardListing;
  validate(listing: StandardListing): boolean;
  cleanup?(): Promise<void>;
}

export interface ScraperJobResult {
  readonly jobId: string;
  readonly sourceId: string;
  readonly status: 'SUCCESS' | 'FAILED';
  readonly listingsProcessed: number;
  readonly listingsUpserted: number;
  readonly errorMessage: string | null;
  readonly startedAt: Date;
  readonly finishedAt: Date;
}
