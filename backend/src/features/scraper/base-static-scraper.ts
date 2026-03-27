import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import type {
  ScraperInterface,
  ScrapeContext,
  RawScrapedListing,
  StandardListing,
} from './scraper.types';

export abstract class BaseStaticScraper implements ScraperInterface {
  abstract readonly sourceId: string;
  abstract readonly scheduleCron: string;

  abstract scrape(context: ScrapeContext): Promise<RawScrapedListing[]>;
  abstract transform(raw: RawScrapedListing): StandardListing;
  abstract validate(listing: StandardListing): boolean;

  protected async fetchPage(url: string, context: ScrapeContext): Promise<CheerioAPI | null> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RealEstateBot/1.0)',
      },
      signal: context.signal,
    });

    if (!response.ok) {
      context.logger.warn({ url, status: response.status }, 'HTTP error fetching page');
      return null;
    }

    const html = await response.text();
    return cheerio.load(html);
  }
}
