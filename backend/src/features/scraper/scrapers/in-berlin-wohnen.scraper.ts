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
      if ((await saveCookieSettingsButton.count()) > 0) {
        logger.info('Saving cookie settings');
        await saveCookieSettingsButton.click();
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
          let snapshotData: Record<string, unknown>;
          try {
            const snapshot = JSON.parse(snapshotStr) as Record<string, unknown>;
            snapshotData = snapshot.data as Record<string, unknown>;

            // data.item is a Livewire-serialized array: [itemObj, {s:"arr"}]
            const itemArr: unknown[] = Array.isArray(snapshotData.item) ? snapshotData.item as unknown[] : [];
            const found = itemArr.find(
              (x) => x !== null && typeof x === 'object' && !('s' in (x as Record<string, unknown>)),
            );
            if (found === undefined) continue;
            item = found as Record<string, unknown>;
          } catch {
            logger.warn('Failed to parse wire:snapshot JSON, skipping listing');
            continue;
          }

          // item.details is deeply nested due to Livewire serialization.
          // Recursively walk the structure to extract {label, value} objects.
          const details = this.extractDetails(item.details);

          // item.address is [addressObj, {s:"arr"}]
          const addressArr: unknown[] = Array.isArray(item.address) ? item.address as unknown[] : [];
          const address = addressArr.find(
            (x) => x !== null && typeof x === 'object' && !('s' in (x as Record<string, unknown>)),
          ) as Record<string, unknown> | undefined;

          // Feature texts are readable via textContent even when the div has display:none.
          const featureSpans = div.locator('div.list__details div > span');
          const featureCount = await featureSpans.count();
          const allTexts = featureCount > 0 ? await featureSpans.allTextContents() : [];
          const features = allTexts.map((t) => t.trim()).filter((t) => t !== '' && !t.startsWith('Eine Wohnung der'));

          const imageEl = div.locator('div.list__details img[alt="Wohnungsbild"]').first();
          const imagePath = (await imageEl.count()) > 0 ? await imageEl.getAttribute('src') : null;

          const id = typeof item.id === 'number' || typeof item.id === 'string' ? String(item.id) : '';
          logger.debug({ id }, 'Scraped listing');
          rawItems.push({
            sourceListingId: id,
            rawData: {
              ...details,
              title: item.title,
              deeplink: item.deeplink,
              imagePath,
              hasWbs: snapshotData.hasWbs,
              rooms: item.rooms,
              area: item.area,
              rentNet: item.rentNet,
              rentGross: item.rentGross,
              occupationDate: item.occupationDate,
              createdAt: item.createdAt,
              constructionYear: item.constructionYear,
              level: item.level,
              levelsTotal: item.levelsTotal,
              finalEnergyValue: item.finalEnergyValue,
              addressStreet: address?.street,
              addressNumber: address?.number,
              addressZipCode: address?.zipCode,
              addressDistrict: address?.district,
              features,
            },
          });
        }

        const nextButtons = page.getByRole('button', { name: /^Vor/ });
        if ((await nextButtons.count()) === 0) break;

        pageNumber = pageNumber + 1;
        logger.info({ pageNumber }, 'Navigating to next page');
        await nextButtons.first().click({ force: true });
        await page.waitForURL((url) => url.searchParams.get('page') === String(pageNumber), {
          waitUntil: 'domcontentloaded'
        });
      }

      logger.info({ total: rawItems.length }, 'Finished scraping all pages');
      return rawItems;
    } finally {
      await browserContext.close();
    }
  }

  // Recursively walks the Livewire-serialized nested array structure (which intersperses
  // {s:"arr"} type markers) and extracts all {label, value} detail objects into a flat record.
  // Values may contain HTML (e.g. "Zentralheizung<br>") — it is stripped.
  private extractDetails(node: unknown, result: Record<string, string> = {}): Record<string, string> {
    if (!Array.isArray(node)) return result;
    for (const child of node) {
      if (Array.isArray(child)) {
        this.extractDetails(child, result);
      } else if (child !== null && typeof child === 'object') {
        const obj = child as Record<string, unknown>;
        if ('s' in obj) continue; // Livewire type marker, skip
        if (typeof obj.label === 'string' && (typeof obj.value === 'string' || typeof obj.value === 'number')) {
          const raw = String(obj.value);
          // eslint-disable-next-line unicorn/prefer-string-replace-all
          result[obj.label] = raw.replace(/<[^>]*>/g, '').trim();
        }
      }
    }
    return result;
  }

  // Parses German-formatted numbers like "1.043,84" or "76,74" → number.
  private parseGermanNumber(value: unknown): number | null {
    if (typeof value === 'number') return value;
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

    const coldRentAmount = this.parseGermanNumber(d.rentNet);
    const warmRentAmount = typeof d.rentGross === 'number' ? d.rentGross : this.parseGermanNumber(d.rentGross);
    const hasCost = coldRentAmount !== null || warmRentAmount !== null;

    const imageUrl = this.getString(d.imagePath);

    const floor = typeof d.level === 'number' ? d.level : null;
    const maxFloor = typeof d.levelsTotal === 'number' ? d.levelsTotal : null;

    const yearOfConstruction = this.parseGermanNumber(d.constructionYear);

    const insertedAt =
      typeof d.createdAt === 'string' && d.createdAt !== '' ? new Date(d.createdAt) : null;

    const addressParts = [
      this.getString(d.addressStreet),
      this.getString(d.addressNumber),
      [this.getString(d.addressZipCode), this.getString(d.addressDistrict)]
        .filter((p) => p !== null)
        .join(' '),
    ].filter((p) => p !== null && p !== '');
    const address = addressParts.length > 0 ? addressParts.join(' ') : null;

    return {
      source: this.sourceId,
      sourceListingId: raw.sourceListingId,
      title: typeof d.title === 'string' ? d.title : '',
      coldRentAmount,
      warmRentAmount,
      priceCurrency: hasCost ? 'EUR' : null,
      freeFrom: this.parseGermanDate(d.occupationDate),
      insertedAt,
      isWBSRequired: typeof d.hasWbs === 'boolean' ? d.hasWbs : null,
      floor,
      maxFloor,
      yearOfConstruction: yearOfConstruction === null ? null : Math.trunc(yearOfConstruction),
      heatingType: this.parseHeatingType(d.Heizung),
      energyType: this.parseEnergyType(d['Hauptenergieträger']),
      energyEfficiencyClass: null,
      energyConsumptionKWhPerYear: this.parseGermanNumber(d.finalEnergyValue),
      address,
      city: 'Berlin',
      country: 'DE',
      areaM2: this.parseGermanNumber(d.area),
      rooms: this.parseGermanNumber(d.rooms),
      listingUrl: this.getString(d.deeplink) ?? '',
      imageUrls: imageUrl === null ? [] : [imageUrl],
      features: (d.features as string[] | null) ?? [],
      rawData: d,
    } satisfies StandardListing;
  }

  validate(listing: StandardListing): boolean {
    return listing.title !== '' && listing.listingUrl !== '';
  }
}
