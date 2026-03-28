import { BaseBrowserScraper } from "../base-browser-scraper";
import { EnergyType, HeatingType } from "../scraper.types";
import type { RawScrapedListing, ScrapeContext, StandardListing } from "../scraper.types";

export class VonoviaScraper extends BaseBrowserScraper {
    readonly sourceId = "vonovia";
    readonly scheduleCron: string = "0 0 * * *"; // Run once a day at midnight

    private readonly LISTINGS_BASE_URL = "https://www.vonovia.de/zuhause-finden/immobilien?rentType=miete&city=Berlin&lift=0&parking=0&cellar=0&minRooms=Beliebig&floor=Beliebig&bathtub=0&bathwindow=0&bathshower=0&furnished=0&kitchenEBK=0&toiletSeparate=0&disabilityAccess=egal&seniorFriendly=0&balcony=egal&garden=0&parkingCarport=0&parkingStellplatz=0&parkingGarage=0&parkingTiefgarage=0&subsidizedHousingPermit=egal&locationDisplay=Berlin&offset=15&immoType=wohnung"
    private readonly BASE_URL = "https://www.vonovia.de";

    async scrape(context: ScrapeContext): Promise<RawScrapedListing[]> {
        const { logger } = context;
        const browserContext = await this.newContext()

        try {
            const page = await browserContext.newPage();

            // ── Phase 1: Collect all listing URLs ────────────────────────────
            logger.info("Navigating to Vonovia listings page");
            await page.goto(this.LISTINGS_BASE_URL, { waitUntil: "networkidle" });

            const cookieConsentButton = page.getByRole('button', { name: 'Use necessary cookies only' });
            if ((await cookieConsentButton.count()) > 0) {
                logger.info("Accepting cookie consent");
                await cookieConsentButton.click();
            }

            const listingUrls: string[] = [];
            let pageNumber = 1;

            for (;;) {
                logger.info({ pageNumber }, 'Collecting listing URLs on page');
                const teasers = page.locator('div.teasers').first();
                const teaserItems = await teasers.locator('div.item').all();

                for (const item of teaserItems) {
                    const href = await item.locator('div.headlines h2.h4 a').getAttribute('href');
                    if (href !== null && href !== '') {
                        listingUrls.push(`${this.BASE_URL}${href}`);
                    }
                }

                const nextButton = page.locator('a.next:not(.disabled)').first();
                if ((await nextButton.count()) === 0) break;

                pageNumber = pageNumber + 1;
                logger.info({ pageNumber }, 'Navigating to next listings page');
                await nextButton.click();
                await page.waitForLoadState('networkidle');
            }

            logger.info({ total: listingUrls.length }, 'Finished collecting listing URLs');

            // ── Phase 2: Visit each detail page and extract data ─────────────
            const rawItems: RawScrapedListing[] = [];

            for (const url of listingUrls) {
                logger.debug({ url }, 'Scraping detail page');
                await page.goto(url, { waitUntil: 'networkidle' });

                const dataEl = page.locator('div.estate-detail-page--vonovia-data').first();
                if ((await dataEl.count()) === 0) {
                    logger.warn({ url }, 'data element not found on detail page, skipping');
                    continue;
                }

                const dataAttr = await dataEl.getAttribute('data-vonovia-data');
                if (dataAttr === null || dataAttr === '') {
                    logger.warn({ url }, 'data-vonovia-data attribute empty, skipping');
                    continue;
                }

                let data: Record<string, unknown>;
                try {
                    data = JSON.parse(dataAttr) as Record<string, unknown>;
                } catch {
                    logger.warn({ url }, 'Failed to parse data-vonovia-data JSON, skipping');
                    continue;
                }

                const objectId = typeof data.objectId === 'string' ? data.objectId : '';
                if (objectId === '') {
                    logger.warn({ url }, 'Missing objectId, skipping');
                    continue;
                }

                logger.debug({ objectId }, 'Scraped listing');
                rawItems.push({ sourceListingId: objectId, rawData: data });
            }

            logger.info({ total: rawItems.length }, 'Finished scraping all detail pages');
            return rawItems;
        } catch (error) {
            logger.error({ error }, "Error occurred while scraping");
            return [];
        } finally {
            await browserContext.close();
        }
    }

    transform(raw: RawScrapedListing): StandardListing {
        const d = raw.rawData;

        const coldRentAmount = typeof d.rent === 'number' ? d.rent : null;
        const warmRentAmount = typeof d.warmRent === 'number' ? d.warmRent : null;
        const hasCost = coldRentAmount !== null || warmRentAmount !== null;

        const areaM2 = this.parseGermanNumber(d.space);
        const rooms = this.parseGermanNumber(d.numberOfRooms);
        const yearOfConstruction = this.parseGermanNumber(d.constructionYear);

        const freeFrom = typeof d.availableFrom === 'string' && d.availableFrom !== ''
            ? new Date(d.availableFrom)
            : null;

        const street = typeof d.streetAndHouseNumber === 'string' ? d.streetAndHouseNumber.trim() : '';
        const postCodeAndCity = typeof d.postCodeAndCity === 'string' ? d.postCodeAndCity.trim() : '';
        const address = [street, postCodeAndCity].filter((p) => p !== '').join(', ') || null;

        const city = this.extractCity(postCodeAndCity);

        const floor = this.parseFloor(d.sections);

        const imageUrls = Array.isArray(d.overlayImages)
            ? (d.overlayImages as Record<string, unknown>[])
                .map((img) => (typeof img.url === 'string' ? img.url : null))
                .filter((url): url is string => url !== null)
            : [];

        const features = Array.isArray(d.features)
            ? (d.features as unknown[])
                .filter((f): f is string => typeof f === 'string')
                .map((f) => f.trim())
                .filter((f) => f !== '')
            : [];

        let listingUrl = '';
        if (typeof d.shareUrl === 'string' && d.shareUrl !== '') {
            listingUrl = d.shareUrl;
        } else if (typeof d.slug === 'string' && d.slug !== '') {
            listingUrl = `${this.BASE_URL}/zuhause-finden/immobilien/${d.slug}`;
        }

        return {
            source: this.sourceId,
            sourceListingId: raw.sourceListingId,
            title: typeof d.heading === 'string' ? d.heading : '',
            coldRentAmount,
            warmRentAmount,
            priceCurrency: hasCost ? 'EUR' : null,
            freeFrom,
            insertedAt: null,
            isWBSRequired: null,
            floor,
            maxFloor: null,
            yearOfConstruction: yearOfConstruction === null ? null : Math.trunc(yearOfConstruction),
            heatingType: this.parseHeatingType(d.heatingType),
            energyType: this.parseEnergyType(d.energySource),
            energyEfficiencyClass: typeof d.energyPassValueClass === 'string' ? d.energyPassValueClass : null,
            energyConsumptionKWhPerYear: this.parseEnergyConsumption(d.energyPassEnergyRequirements),
            address,
            city,
            country: 'DE',
            areaM2,
            rooms,
            listingUrl,
            imageUrls,
            features,
            rawData: d,
        } satisfies StandardListing;
    }

    validate(listing: StandardListing): boolean {
        return listing.title !== '' && listing.listingUrl !== '';
    }

    // Parses German-formatted numbers like "69,68 m²" or "2" → number.
    private parseGermanNumber(value: unknown): number | null {
        if (typeof value === 'number') return value;
        if (typeof value !== 'string') return null;
        // eslint-disable-next-line unicorn/prefer-string-replace-all
        const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
        const parsed = Number.parseFloat(cleaned);
        return Number.isNaN(parsed) ? null : parsed;
    }

    // Extracts "Berlin" from "12207 Berlin OT Lichterfelde".
    private extractCity(postCodeAndCity: string): string | null {
        if (postCodeAndCity === '') return null;
        const match = /^\d{5}\s+(\S+)/.exec(postCodeAndCity);
        return match === null ? null : match[1];
    }

    // Parses floor number from sections array ("6. Obergeschoss" → 6).
    private parseFloor(sections: unknown): number | null {
        if (!Array.isArray(sections)) return null;
        for (const section of sections) {
            if (section === null || typeof section !== 'object') continue;
            const rows = (section as Record<string, unknown>).rows;
            if (!Array.isArray(rows)) continue;
            for (const row of rows) {
                if (row === null || typeof row !== 'object') continue;
                const r = row as Record<string, unknown>;
                if (r.label === 'Geschoss' && typeof r.value === 'string') {
                    const match = /^(\d+)\./.exec(r.value.trim());
                    return match === null ? null : Number.parseInt(match[1], 10);
                }
            }
        }
        return null;
    }

    // Parses "93kWh/(m2*a)" or "93 kWh/(m²a)" → 93.
    private parseEnergyConsumption(value: unknown): number | null {
        if (typeof value !== 'string') return null;
        const match = /^(\d+(?:[.,]\d+)?)/u.exec(value.trim());
        if (match === null) return null;
        return Number.parseFloat(match[1].replace(',', '.'));
    }

    private parseHeatingType(value: unknown): HeatingType | null {
        if (typeof value !== 'string') return null;
        const upper = value.toUpperCase().trim();
        if (upper === 'ZENTRAL') return HeatingType.CENTRAL;
        if (upper === 'FERNWAERME' || upper === 'FERNWÄRME' || upper === 'FERN') return HeatingType.DISTRICT;
        if (upper === 'ELEKTRO' || upper === 'ELECTRIC') return HeatingType.ELECTRIC;
        if (upper === 'GAS') return HeatingType.GAS;
        if (upper === 'OEL' || upper === 'ÖL' || upper === 'OIL') return HeatingType.OIL;
        return HeatingType.OTHER;
    }

    private parseEnergyType(value: unknown): EnergyType | null {
        if (typeof value !== 'string') return null;
        const upper = value.toUpperCase().trim();
        if (upper === 'FERN' || upper === 'FERNWÄRME' || upper === 'FERNWAERME') return EnergyType.FERNWÄRME;
        if (upper === 'STROM') return EnergyType.STROM;
        if (upper === 'GAS') return EnergyType.GAS;
        if (upper === 'OEL' || upper === 'ÖL') return EnergyType.OEL;
        if (upper === 'SOLAR') return EnergyType.SOLAR;
        return EnergyType.ANDERE;
    }
}
