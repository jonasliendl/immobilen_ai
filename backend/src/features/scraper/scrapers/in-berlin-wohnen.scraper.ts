import type { Locator } from 'playwright';
import { BaseBrowserScraper } from '../base-browser-scraper';
import { EnergyType, HeatingType } from '../scraper.types';
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

      const rawItems: RawScrapedListing[] = [];

      for (;;) {
        const listingSections: Locator[] = await page
          .getByRole('button', { name: /^Wohnungsangebot/ })
          .all();

        for (const listing of listingSections) {
          await listing.click();

          const detailsDiv = listing.locator('..').locator('div.list__details');
          await detailsDiv.waitFor({ state: 'visible' });

          const rawTitle = await detailsDiv.locator('span').first().textContent();
          const title = rawTitle?.trim() ?? '';

          const dts = await detailsDiv.locator('dt').allTextContents();
          const dds = await detailsDiv.locator('dd').allTextContents();

          const details: Record<string, string> = {};
          for (let i = 0; i < Math.min(dts.length, dds.length); i++) {
            // eslint-disable-next-line security/detect-object-injection
            details[dts[i].trim().slice(0, -1)] = dds[i].trim();
          }

          const image = await detailsDiv.locator('img').first().getAttribute('src');
          if (image !== null) {
            details.imageUrl = image;
          }

          const url = await detailsDiv.locator('a').first().getAttribute('href');
          if (url !== null) {
            details.url = url;
          }

          const featureSpans = detailsDiv.locator('div > span');
          const featureSpanCount = await featureSpans.count();
          const featureTexts =
            featureSpanCount > 0
              ? await featureSpans.allTextContents()
              : [];
          const features = featureTexts.map((t) => t.trim()).filter((t) => t !== '');

          rawItems.push({
            sourceListingId: title,
            rawData: { title, features, ...details },
          });
        }

        const nextButton = page.getByRole('button', { name: /^Vor/ });
        if ((await nextButton.count()) === 0) break;

        await nextButton.click();
        await page.waitForLoadState('networkidle');
      }

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
    return lower.includes('unbekannt') || lower.includes('unknown') || lower.includes('keine angabe') || lower === '-';
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
    const imageUrl = this.getString(d.imageUrl);
    const { floor, maxFloor } = this.parseFloor(d.Etage);
    const baujahr = this.parseGermanNumber(d.Baujahr);

    return {
      source: this.sourceId,
      sourceListingId: raw.sourceListingId,
      title: typeof d.title === 'string' ? d.title : '',
      coldRentAmount,
      warmRentAmount,
      priceCurrency: hasCost ? 'EUR' : null,
      freeFrom: this.parseGermanDate(d['Frei ab']),
      insertedAt: this.parseGermanDate(d['Eingestellt am']),
      isWBSRequired: typeof d.WBS === 'string' ? d.WBS.toLowerCase().includes('erforderlich') : null,
      floor,
      maxFloor,
      yearOfConstruction: baujahr === null ? null : Math.trunc(baujahr),
      heatingType: this.parseHeatingType(d.Heizungsart),
      energyType: this.parseEnergyType(d['Energieträger']),
      energyEfficiencyClass: this.getString(d.Energieeffizienzklasse),
      energyConsumptionKWhPerYear: this.parseGermanNumber(d.Endenergieverbrauch),
      address: this.getString(d.Adresse),
      city: 'Berlin',
      country: 'DE',
      areaM2: this.parseGermanNumber(d['Wohnfläche']),
      rooms: this.parseGermanNumber(d.Zimmeranzahl),
      listingUrl: this.getString(d.url) ?? '',
      imageUrls: imageUrl === null ? [] : [imageUrl],
      features: (d.features as string[] | null) ?? [],
      rawData: d,
    };
  }

  validate(listing: StandardListing): boolean {
    return listing.title !== '' && listing.listingUrl !== '';
  }
}
