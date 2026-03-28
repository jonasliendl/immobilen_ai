---
applyTo: "backend/src/features/scraper/**"
---

# Scraper Development Instructions

## ScraperInterface Contract

Every scraper must implement `ScraperInterface` from `scraper.types.ts`:

```ts
interface ScraperInterface {
  readonly sourceId: string;        // Unique kebab-case ID (e.g., "in-berlin-wohnen")
  readonly scheduleCron: string;    // Cron schedule (e.g., "0 2 * * *")
  initialize?(): Promise<void>;     // Optional setup (browser launch, auth)
  scrape(context: ScrapeContext): Promise<RawScrapedListing[]>;
  transform(raw: RawScrapedListing): StandardListing;
  validate(listing: StandardListing): boolean;
  cleanup?(): Promise<void>;        // Optional teardown (browser close)
}
```

## Base Classes

- **`BaseBrowserScraper`** — For JavaScript-rendered pages. Uses Playwright with headless Chromium. Provides `newContext()` with German locale and realistic user agent. Call `initialize()` before scraping and `cleanup()` after.
- **`BaseStaticScraper`** — For static HTML pages. Uses Cheerio. Provides `fetchPage(url, context)` returning a CheerioAPI instance.

## Creating a New Scraper

1. Create `scrapers/{source-id}.scraper.ts` extending the appropriate base class
2. Set `sourceId` to a unique kebab-case identifier
3. Set `scheduleCron` (Berlin rental sites: use `"0 2 * * *"` for nightly)
4. Implement `scrape()`: fetch pages and return `RawScrapedListing[]`
5. Implement `transform()`: map raw data → `StandardListing` fields
6. Implement `validate()`: return `false` for listings missing critical fields (title, listingUrl, sourceListingId)
7. Register in `scraper.registry.ts` by adding instance to `scraperRegistry` array

## StandardListing Fields

Required: `source`, `sourceListingId`, `title`, `listingUrl`
Important: `warmRentAmount`, `coldRentAmount`, `areaM2`, `rooms`, `address`, `city`
Optional: `floor`, `maxFloor`, `yearOfConstruction`, `heatingType`, `energyType`, `freeFrom`, `isWBSRequired`, `imageUrls`, `features`

## Conventions

- Always pass `context.signal` to fetch/network calls for abort support
- Use `context.logger` for all logging (not `console.log`)
- Transform amounts to numbers (cents → euros if needed)
- Parse German date formats (DD.MM.YYYY)
- Handle pagination in `scrape()` — loop until no more pages
- Keep `rawData` on each listing for debugging
