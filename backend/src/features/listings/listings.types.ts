import { z } from 'zod';

const ALLOWED_SORT_FIELDS = [
  'firstSeenAt',
  'lastSeenAt',
  'coldRentAmount',
  'warmRentAmount',
  'rooms',
  'areaM2',
  'freeFrom',
  'yearOfConstruction',
] as const;

export const ListingsQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Sorting
  sortBy: z.enum(ALLOWED_SORT_FIELDS).default('firstSeenAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Text search (title + address)
  q: z.string().optional(),

  // Identity / source
  source: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),

  // Rent ranges
  minColdRent: z.coerce.number().optional(),
  maxColdRent: z.coerce.number().optional(),
  minWarmRent: z.coerce.number().optional(),
  maxWarmRent: z.coerce.number().optional(),

  // Rooms & area
  minRooms: z.coerce.number().optional(),
  maxRooms: z.coerce.number().optional(),
  minAreaM2: z.coerce.number().optional(),
  maxAreaM2: z.coerce.number().optional(),

  // Occupancy
  isWBSRequired: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  freeFromAfter: z.coerce.date().optional(),
  freeFromBefore: z.coerce.date().optional(),

  // Building
  minFloor: z.coerce.number().int().optional(),
  maxFloor: z.coerce.number().int().optional(),
  minYearOfConstruction: z.coerce.number().int().optional(),
  maxYearOfConstruction: z.coerce.number().int().optional(),

  // Energy & heating
  heatingType: z.string().optional(),
  energyType: z.string().optional(),
  energyEfficiencyClass: z.string().optional(),
  minEnergyConsumption: z.coerce.number().optional(),
  maxEnergyConsumption: z.coerce.number().optional(),

  // Features (comma-separated; all supplied values must be present on the listing)
  features: z
    .string()
    .transform((v) => v.split(',').map((f) => f.trim()))
    .optional(),

  // Validity — default true so invalid/stale listings are excluded
  isValid: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .default(true),
});

export type ListingsQuery = z.infer<typeof ListingsQuerySchema>;
