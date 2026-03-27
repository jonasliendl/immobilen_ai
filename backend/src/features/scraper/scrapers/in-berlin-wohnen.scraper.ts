import { BaseBrowserScraper } from '../base-browser-scraper';
import type { RawScrapedListing, ScrapeContext, StandardListing } from '../scraper.types';

export class InBerlinWohnenScraper extends BaseBrowserScraper {
  readonly sourceId = 'in-berlin-wohnen';
  readonly scheduleCron = '0 2 * * *';

  private readonly LISTINGS_URL = 'https://www.inberlinwohnen.de/wohnungsfinder';

  async scrape(_context: ScrapeContext): Promise<RawScrapedListing[]> {
    const browserContext = await this.newContext();

    try {
      const page = await browserContext.newPage();
      await page.goto(this.LISTINGS_URL, {
        waitUntil: 'networkidle',
      });

      const cards = await page.locator('[data-testid="listing-card"]').all();
      const rawItems: RawScrapedListing[] = [];

      for (const card of cards) {
        const id = await card.getAttribute('data-id');

        if (id === null || id === '') {
          continue;
        }

        const rawTitle = await card.locator('.title').textContent();
        const title = rawTitle?.trim() ?? '';
        const price = (await card.getAttribute('data-price')) ?? '';
        const url = (await card.locator('a').getAttribute('href')) ?? '';

        rawItems.push({
          sourceListingId: id,
          rawData: { title, price, url },
        });
      }

      return rawItems;
    } finally {
      await browserContext.close();
    }
  }

  transform(raw: RawScrapedListing): StandardListing {
    const title = typeof raw.rawData.title === 'string' ? raw.rawData.title : '';
    const priceStr = typeof raw.rawData.price === 'string' ? raw.rawData.price : null;
    const url = typeof raw.rawData.url === 'string' ? raw.rawData.url : '';

    return {
      source: this.sourceId,
      sourceListingId: raw.sourceListingId,
      title,
      priceAmount: priceStr !== null && priceStr !== '' ? Number(priceStr) : null,
      priceCurrency: priceStr !== null && priceStr !== '' ? 'EUR' : null,
      address: null,
      city: null,
      country: null,
      areaM2: null,
      rooms: null,
      listingUrl: url,
      imageUrls: [],
      rawData: raw.rawData,
    };
  }

  validate(listing: StandardListing): boolean {
    return listing.title !== '' && listing.listingUrl !== '';
  }
}
