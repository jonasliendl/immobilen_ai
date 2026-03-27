import type { ScraperInterface } from './scraper.types';
import { ExampleStaticScraper } from './scrapers/example-static.scraper';
import { InBerlinWohnenScraper } from './scrapers/in-berlin-wohnen.scraper';

// Add new scraper instances here to activate them in both the scheduler and the API.
export const scraperRegistry: ScraperInterface[] = [
  new ExampleStaticScraper(),
  new InBerlinWohnenScraper(),
];
