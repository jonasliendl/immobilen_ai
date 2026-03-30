import { Prisma } from '@prisma/client';
import type { Listing } from '@prisma/client';
import { getDbRo } from '../../database/client-ro';
import type { ListingsQuery } from './listings.types';

export interface GetListingsResult {
  readonly data: Listing[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export async function getListings(query: ListingsQuery): Promise<GetListingsResult> {
  const db = getDbRo();
  const { page, limit, sortBy, sortOrder, q, features, isValid, includeMietpreisbremse, mietpreisbremseVerdict, ...filters } = query;
  const offset = (page - 1) * limit;

  const conditions: Prisma.Sql[] = [Prisma.sql`"isValid" = ${isValid}`];

  if (q !== undefined) {
    const pattern = `%${q}%`;
    conditions.push(Prisma.sql`(title ILIKE ${pattern} OR address ILIKE ${pattern})`);
  }

  if (filters.source !== undefined) {
    conditions.push(Prisma.sql`source = ${filters.source}`);
  }
  if (filters.city !== undefined) {
    conditions.push(Prisma.sql`city = ${filters.city}`);
  }
  if (filters.country !== undefined) {
    conditions.push(Prisma.sql`country = ${filters.country}`);
  }

  if (filters.minColdRent !== undefined) {
    conditions.push(Prisma.sql`"coldRentAmount" >= ${filters.minColdRent}`);
  }
  if (filters.maxColdRent !== undefined) {
    conditions.push(Prisma.sql`"coldRentAmount" <= ${filters.maxColdRent}`);
  }
  if (filters.minWarmRent !== undefined) {
    conditions.push(Prisma.sql`"warmRentAmount" >= ${filters.minWarmRent}`);
  }
  if (filters.maxWarmRent !== undefined) {
    conditions.push(Prisma.sql`"warmRentAmount" <= ${filters.maxWarmRent}`);
  }

  if (filters.minRooms !== undefined) {
    conditions.push(Prisma.sql`rooms >= ${filters.minRooms}`);
  }
  if (filters.maxRooms !== undefined) {
    conditions.push(Prisma.sql`rooms <= ${filters.maxRooms}`);
  }
  if (filters.minAreaM2 !== undefined) {
    conditions.push(Prisma.sql`"areaM2" >= ${filters.minAreaM2}`);
  }
  if (filters.maxAreaM2 !== undefined) {
    conditions.push(Prisma.sql`"areaM2" <= ${filters.maxAreaM2}`);
  }

  if (filters.isWBSRequired !== undefined) {
    conditions.push(Prisma.sql`"isWBSRequired" = ${filters.isWBSRequired}`);
  }
  if (filters.freeFromAfter !== undefined) {
    conditions.push(Prisma.sql`"freeFrom" >= ${filters.freeFromAfter}`);
  }
  if (filters.freeFromBefore !== undefined) {
    conditions.push(Prisma.sql`"freeFrom" <= ${filters.freeFromBefore}`);
  }

  if (filters.minFloor !== undefined) {
    conditions.push(Prisma.sql`floor >= ${filters.minFloor}`);
  }
  if (filters.maxFloor !== undefined) {
    conditions.push(Prisma.sql`floor <= ${filters.maxFloor}`);
  }
  if (filters.minYearOfConstruction !== undefined) {
    conditions.push(Prisma.sql`"yearOfConstruction" >= ${filters.minYearOfConstruction}`);
  }
  if (filters.maxYearOfConstruction !== undefined) {
    conditions.push(Prisma.sql`"yearOfConstruction" <= ${filters.maxYearOfConstruction}`);
  }

  if (filters.heatingType !== undefined) {
    conditions.push(Prisma.sql`"heatingType" = ${filters.heatingType}`);
  }
  if (filters.energyType !== undefined) {
    conditions.push(Prisma.sql`"energyType" = ${filters.energyType}`);
  }
  if (filters.energyEfficiencyClass !== undefined) {
    conditions.push(Prisma.sql`"energyEfficiencyClass" = ${filters.energyEfficiencyClass}`);
  }
  if (filters.minEnergyConsumption !== undefined) {
    conditions.push(
      Prisma.sql`"energyConsumptionKWhPerYear" >= ${filters.minEnergyConsumption}`,
    );
  }
  if (filters.maxEnergyConsumption !== undefined) {
    conditions.push(
      Prisma.sql`"energyConsumptionKWhPerYear" <= ${filters.maxEnergyConsumption}`,
    );
  }

  if (features !== undefined) {
    const featureParams = Prisma.join(features.map((f) => Prisma.sql`${f}`));
    conditions.push(Prisma.sql`features @> ARRAY[${featureParams}]::text[]`);
  }

  if (mietpreisbremseVerdict !== undefined) {
    conditions.push(
      Prisma.sql`"mietpreisbremseVerdict"::text = ${mietpreisbremseVerdict}`,
    );
  }

  const where = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
  // sortBy is validated by Zod enum; sortOrder is 'asc' or 'desc' — safe to embed
  const orderBy = Prisma.raw(`"${sortBy}" ${sortOrder.toUpperCase()}`);

  const [rows, countRows] = await Promise.all([
    db.$queryRaw<Listing[]>`
      SELECT * FROM "Listing" ${where}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `,
    db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) AS count FROM "Listing" ${where}
    `,
  ]);

  const total = Number(countRows[0].count);

  return { data: rows, total, page, limit };
}

export async function getListingById(id: string): Promise<Listing | null> {
  return getDbRo().listing.findUnique({ where: { id } });
}
