---
name: add-scraper
description: 'Create a new web scraper for a Berlin rental listing source. Use when user asks to add a new scraper, support a new rental website, or build a scraper for a new source.'
argument-hint: 'Name or URL of the rental website to scrape'
---

# Add New Scraper

Create a new scraper to fetch rental listings from a Berlin housing website.

## When to Use

- User wants to scrape a new rental listing website
- User asks to "add a scraper for [website]"
- User wants to support a new listing source

## Procedure

### 1. Analyze the Target Website

- Visit the target URL and determine if it's static HTML or JavaScript-rendered
- **Static HTML** → Extend `BaseStaticScraper` (uses Cheerio, lighter)
- **JS-rendered** → Extend `BaseBrowserScraper` (uses Playwright, heavier)
- Identify the listing page URL pattern and pagination mechanism
- Identify DOM selectors for listing data

### 2. Create the Scraper File

Create `backend/src/features/scraper/scrapers/{source-id}.scraper.ts`:

```ts
import type { ScrapeContext, RawScrapedListing, StandardListing } from '../scraper.types';
import { BaseBrowserScraper } from '../base-browser-scraper';
// OR: import { BaseStaticScraper } from '../base-static-scraper';

export class MySourceScraper extends BaseBrowserScraper {
  readonly sourceId = 'my-source';
  readonly scheduleCron = '0 2 * * *';

  async scrape(context: ScrapeContext): Promise<RawScrapedListing[]> {
    // Fetch pages, extract raw listing data
    // Use context.logger for logging
    // Pass context.signal to network calls
  }

  transform(raw: RawScrapedListing): StandardListing {
    // Map raw.rawData fields → StandardListing
    // Parse German number/date formats
  }

  validate(listing: StandardListing): boolean {
    // Return false for unusable listings
    return !!(listing.title && listing.listingUrl && listing.sourceListingId);
  }
}
```

### 3. Register the Scraper

Edit `backend/src/features/scraper/scraper.registry.ts`:

```ts
import { MySourceScraper } from './scrapers/my-source.scraper';

export const scraperRegistry: ScraperInterface[] = [
  new InBerlinWohnenScraper(),
  new MySourceScraper(),  // ← Add here
];
```

### 4. Test the Scraper

```sh
curl -s -X POST http://localhost:8080/api/v1/scrapers/my-source/run | jq .
```

Verify:
- `status: "SUCCESS"`
- `listingsProcessed` > 0
- `listingsUpserted` > 0

### 5. Verify Data

```sh
curl -s "http://localhost:8080/api/v1/listings?limit=5" | jq '.[] | select(.source == "my-source")'
```

## Reference Files

- [ScraperInterface type](../../../backend/src/features/scraper/scraper.types.ts)
- [BaseBrowserScraper](../../../backend/src/features/scraper/base-browser-scraper.ts)
- [BaseStaticScraper](../../../backend/src/features/scraper/base-static-scraper.ts)
- [Example: InBerlinWohnen scraper](../../../backend/src/features/scraper/scrapers/in-berlin-wohnen.scraper.ts)
- [Scraper registry](../../../backend/src/features/scraper/scraper.registry.ts)

## Checklist

- [ ] File named `{source-id}.scraper.ts` in `scrapers/` directory
- [ ] `sourceId` is unique kebab-case matching filename
- [ ] `scheduleCron` set appropriately (nightly: `0 2 * * *`)
- [ ] `scrape()` handles pagination and uses `context.signal`
- [ ] `transform()` maps all available fields to `StandardListing`
- [ ] `validate()` rejects listings missing title, URL, or sourceListingId
- [ ] Registered in `scraper.registry.ts`
- [ ] Test run returns SUCCESS with listings
