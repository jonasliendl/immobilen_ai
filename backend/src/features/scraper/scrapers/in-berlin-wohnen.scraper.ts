import { BaseBrowserScraper } from '../base-browser-scraper';
import { EnergyType, HeatingType } from '../scraper.types';
import type { RawScrapedListing, ScrapeContext, StandardListing } from '../scraper.types';

export class InBerlinWohnenScraper extends BaseBrowserScraper {
  readonly sourceId = 'in-berlin-wohnen';
  readonly scheduleCron = '0 2 * * *';

  private readonly LISTINGS_URL = 'https://www.inberlinwohnen.de/wohnungsfinder';

  async scrape(context: ScrapeContext): Promise<RawScrapedListing[]> {
    const { logger } = context;
    const browserContext = await this.newContext();

    try {
      const page = await browserContext.newPage();
      logger.info('Navigating to listings page');
      await page.goto(this.LISTINGS_URL, { waitUntil: 'networkidle' });

      const saveCookieSettingsButton = page.getByRole('button', { name: 'Speichern' });
      if (await saveCookieSettingsButton.count() > 0) {
        logger.info('Saving cookie settings');

        await page.getByRole('button', { name: 'Speichern' }).click();
      }

      const rawItems: RawScrapedListing[] = [];
      let pageNumber = 1;

      for (;;) {
        const snapshotDivs = await page.locator(String.raw`[wire\:snapshot]`).all();
        logger.info({ pageNumber, count: snapshotDivs.length }, 'Scraping listings on page');

        for (const div of snapshotDivs) {
          const snapshotStr = await div.getAttribute('wire:snapshot');
          if (snapshotStr === null || snapshotStr === '') continue;

          let item: Record<string, unknown>;
          try {
            const snapshot = JSON.parse(snapshotStr) as Record<string, unknown>;
            const items = (snapshot.data as Record<string, unknown> | undefined)?.item;
            if (!Array.isArray(items) || items.length === 0) continue;
            item = items[0] as Record<string, unknown>;
          } catch {
            logger.warn('Failed to parse wire:snapshot JSON, skipping listing');
            continue;
          }

          // Convert the details array (same data as the dt/dd pairs in the DOM) to a flat record.
          // Values may contain HTML (e.g. "Zentralheizung<br>") — strip it.
          const details: Record<string, string> = {};
          if (Array.isArray(item.details)) {
            for (const detail of item.details as Record<string, unknown>[]) {
              if (typeof detail.label === 'string' && detail.value !== null && detail.value !== undefined) {
                const raw = typeof detail.value === 'string' ? detail.value : JSON.stringify(detail.value);
                // eslint-disable-next-line unicorn/prefer-string-replace-all
                details[detail.label] = raw.replace(/<[^>]*>/g, '').trim();
              }
            }
          }

          // Feature texts are readable via textContent even when the div has display:none.
          const featureSpans = div.locator('div.list__details div > span');
          const featureCount = await featureSpans.count();
          const featureTexts =
            featureCount > 0
              ? (await featureSpans.allTextContents())
              : [];
          const features = featureTexts.map((t) => t.trim()).filter((t) => t !== '')

          const id = typeof item.id === 'number' || typeof item.id === 'string' ? String(item.id) : '';
          logger.debug({ id }, 'Scraped listing');
          rawItems.push({
            sourceListingId: id,
            rawData: {
              ...details,
              title: item.title,
              deeplink: item.deeplink,
              imagePath: item.imagePath,
              features,
            },
          });
        }

        const nextButtons = page.getByRole('button', { name: /^Vor/ });
        if ((await nextButtons.count()) === 0) break;

        pageNumber++;
        logger.info({ pageNumber }, 'Navigating to next page');
        await nextButtons.first().click({ force: true });
        await page.waitForURL((url) => url.searchParams.get('page') === String(pageNumber));
      }

      logger.info({ total: rawItems.length }, 'Finished scraping all pages');
      return rawItems;
    } finally {
      await browserContext.close();
    }
  }

  // Parses German-formatted numbers like "1.043,84 €" or "76,74 m²" → number.
  private parseGermanNumber(value: unknown): number | null {
    if (typeof value !== 'string') return null;
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const parsed = Number.parseFloat(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  }

  // Parses German date format "DD.MM.YYYY" → Date.
  private parseGermanDate(value: unknown): Date | null {
    if (typeof value !== 'string') return null;
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
    if (match === null) return null;
    const date = new Date(`${match[3]}-${match[2]}-${match[1]}`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Parses floor string like "1 von (insg. 10)" → { floor: 1, maxFloor: 10 }.
  private parseFloor(value: unknown): { floor: number | null; maxFloor: number | null } {
    if (typeof value !== 'string') return { floor: null, maxFloor: null };
    const match = /^(\d+)\s+von\s+\(insg\.\s*(\d+)\)/.exec(value);
    if (match === null) return { floor: null, maxFloor: null };
    return { floor: Number(match[1]), maxFloor: Number(match[2]) };
  }

  private getString(value: unknown): string | null {
    return typeof value === 'string' && value !== '' ? value : null;
  }

  private isUnknown(lower: string): boolean {
    return (
      lower.includes('unbekannt') ||
      lower.includes('unknown') ||
      lower.includes('keine angabe') ||
      lower === '-'
    );
  }

  private parseHeatingType(value: unknown): HeatingType | null {
    if (typeof value !== 'string') return null;
    const lower = value.toLowerCase().trim();
    if (this.isUnknown(lower)) return null;
    if (lower.includes('zentral')) return HeatingType.CENTRAL;
    if (lower.includes('fernwärme') || lower.includes('fernwaerme')) return HeatingType.DISTRICT;
    if (lower.includes('elektr')) return HeatingType.ELECTRIC;
    if (lower.includes('gas')) return HeatingType.GAS;
    if (lower.includes('öl') || lower.includes('oel') || lower.includes('oil')) return HeatingType.OIL;
    return HeatingType.OTHER;
  }

  private parseEnergyType(value: unknown): EnergyType | null {
    if (typeof value !== 'string') return null;
    const lower = value.toLowerCase().trim();
    if (this.isUnknown(lower)) return null;
    if (lower.includes('fernwärme') || lower.includes('fernwaerme')) return EnergyType.FERNWÄRME;
    if (lower.includes('strom')) return EnergyType.STROM;
    if (lower.includes('gas')) return EnergyType.GAS;
    if (lower.includes('öl') || lower.includes('oel') || lower.includes('oil')) return EnergyType.OEL;
    if (lower.includes('solar')) return EnergyType.SOLAR;
    return EnergyType.ANDERE;
  }

  transform(raw: RawScrapedListing): StandardListing {
    const d = raw.rawData;
    const coldRentAmount = this.parseGermanNumber(d.Kaltmiete);
    const warmRentAmount = this.parseGermanNumber(d.Gesamtmiete);
    const hasCost = coldRentAmount !== null || warmRentAmount !== null;
    const imageUrl = this.getString(d.imagePath);
    const { floor, maxFloor } = this.parseFloor(d.Etage);
    const baujahr = this.parseGermanNumber(d.Baujahr);

    return {
      source: this.sourceId,
      sourceListingId: raw.sourceListingId,
      title: typeof d.title === 'string' ? d.title : '',
      coldRentAmount,
      warmRentAmount,
      priceCurrency: hasCost ? 'EUR' : null,
      freeFrom: this.parseGermanDate(d['Bezugsfertig ab']),
      insertedAt: this.parseGermanDate(d['Eingestellt am']),
      isWBSRequired: typeof d.WBS === 'string' ? d.WBS.toLowerCase().includes('erforderlich') : null,
      floor,
      maxFloor,
      yearOfConstruction: baujahr === null ? null : Math.trunc(baujahr),
      heatingType: this.parseHeatingType(d.Heizung),
      energyType: this.parseEnergyType(d['Hauptenergieträger']),
      energyEfficiencyClass: this.getString(d.Energieeffizienzklasse),
      energyConsumptionKWhPerYear: this.parseGermanNumber(d.Energieverbrauchskennwert),
      address: this.getString(d.Adresse),
      city: 'Berlin',
      country: 'DE',
      areaM2: this.parseGermanNumber(d['Wohnfläche']),
      rooms: this.parseGermanNumber(d.Zimmeranzahl),
      listingUrl: this.getString(d.deeplink) ?? '',
      imageUrls: imageUrl === null ? [] : [imageUrl],
      features: (d.featureTexts as string[] | null) ?? [],
      rawData: d,
    } satisfies StandardListing;
  }

  validate(listing: StandardListing): boolean {
    return listing.title !== '' && listing.listingUrl !== '';
  }
}
