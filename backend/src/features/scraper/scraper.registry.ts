import type { ScraperInterface } from './scraper.types';
import { InBerlinWohnenScraper } from './scrapers/in-berlin-wohnen.scraper';

// Add new scraper instances here to activate them in both the scheduler and the API.
export const scraperRegistry: ScraperInterface[] = [
  new InBerlinWohnenScraper(),
];
