import { BaseStaticScraper } from '../base-static-scraper';
import type { ScrapeContext, RawScrapedListing, StandardListing } from '../scraper.types';

export class ExampleStaticScraper extends BaseStaticScraper {
  readonly sourceId = 'example-static';
  readonly scheduleCron = '0 */6 * * *';

  async scrape(context: ScrapeContext): Promise<RawScrapedListing[]> {
    const $ = await this.fetchPage('https://example.com/listings', context);

    if ($ === null) {
      return [];
    }

    const listings: RawScrapedListing[] = [];

    $('.listing-card').each((_index, element) => {
      const el = $(element);
      const id = el.attr('data-listing-id');

      if (id === undefined || id === '') {
        return;
      }

      listings.push({
        sourceListingId: id,
        rawData: {
          title: el.find('.listing-title').text().trim(),
          price: el.find('.listing-price').attr('data-price'),
          url: el.find('a').attr('href'),
          city: el.find('.listing-city').text().trim(),
        },
      });
    });

    return listings;
  }

  transform(raw: RawScrapedListing): StandardListing {
    const title = typeof raw.rawData.title === 'string' ? raw.rawData.title : '';
    const priceStr = typeof raw.rawData.price === 'string' ? raw.rawData.price : null;
    const url = typeof raw.rawData.url === 'string' ? raw.rawData.url : '';
    const city = typeof raw.rawData.city === 'string' ? raw.rawData.city : null;

    const coldRentAmount = priceStr === null ? null : Number(priceStr);

    return {
      source: this.sourceId,
      sourceListingId: raw.sourceListingId,
      title,
      coldRentAmount,
      warmRentAmount: null,
      priceCurrency: coldRentAmount === null ? null : 'EUR',
      freeFrom: null,
      insertedAt: null,
      isWBSRequired: null,
      floor: null,
      maxFloor: null,
      yearOfConstruction: null,
      heatingType: null,
      energyType: null,
      energyEfficiencyClass: null,
      energyConsumptionKWhPerYear: null,
      address: null,
      city,
      country: 'DE',
      areaM2: null,
      rooms: null,
      listingUrl: url,
      imageUrls: [],
      features: [],
      rawData: raw.rawData,
    };
  }

  validate(listing: StandardListing): boolean {
    return listing.title !== '' && listing.listingUrl !== '';
  }
}
