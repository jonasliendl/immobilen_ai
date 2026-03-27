import type { Browser, BrowserContext } from 'playwright';
import { chromium } from 'playwright';
import type {
  ScraperInterface,
  ScrapeContext,
  RawScrapedListing,
  StandardListing,
} from './scraper.types';

export abstract class BaseBrowserScraper implements ScraperInterface {
  abstract readonly sourceId: string;
  abstract readonly scheduleCron: string;

  protected browser: Browser | null = null;

  abstract scrape(context: ScrapeContext): Promise<RawScrapedListing[]>;
  abstract transform(raw: RawScrapedListing): StandardListing;
  abstract validate(listing: StandardListing): boolean;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
  }

  async cleanup(): Promise<void> {
    await this.browser?.close();
    this.browser = null;
  }

  protected async newContext(): Promise<BrowserContext> {
    if (this.browser === null) {
      throw new Error(
        `Browser not initialized for scraper ${this.sourceId}. Call initialize() first.`,
      );
    }
    return this.browser.newContext({
      userAgent: 'Mozilla/5.0 (compatible; RealEstateBot/1.0)',
    });
  }
}
