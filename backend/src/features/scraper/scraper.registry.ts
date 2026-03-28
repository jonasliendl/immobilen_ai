import type { ScraperInterface } from './scraper.types';
import { DeutscheWohnenScraper } from './scrapers/deutsche-wohnen.scraper';
import { InBerlinWohnenScraper } from './scrapers/in-berlin-wohnen.scraper';
import { VonoviaScraper } from './scrapers/vonovia.scraper';

// Add new scraper instances here to activate them in both the scheduler and the API.
export const scraperRegistry: ScraperInterface[] = [
  new InBerlinWohnenScraper(),
  new VonoviaScraper(),
  new DeutscheWohnenScraper(),
];
