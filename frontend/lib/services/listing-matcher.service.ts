import { Prisma } from '@prisma/client';
import { getDbRo } from '../db-ro';
import { notifyListingAlert } from './notifications.service';

interface Logger {
    error(obj: Record<string, unknown>, msg: string): void;
}

interface ListingCandidate {
    id: string;
    title: string;
    listingUrl: string;
    coldRentAmount: number | null;
    warmRentAmount: number | null;
    rooms: number | null;
    areaM2: number | null;
    address: string | null;
    isWBSRequired: boolean | null;
}

interface TenantPreferenceRow {
    tenantId: string;
    tenantName: string;
    tenantEmail: string | null;
    tenantWhatsappNumber: string | null;
    minRooms: number | null;
    maxRooms: number | null;
    minAreaM2: number | null;
    maxColdRent: number | null;
    maxWarmRent: number | null;
    wbsRequired: boolean | null;
    preferredDistricts: string[];
}

export interface ListingAlertRunSummary {
    newListings: number;
    matchedTenants: number;
    channelsCreated: number;
    channelsSent: number;
    channelsFailed: number;
    channelsSkippedDuplicate: number;
}

function toNumber(value: unknown): number | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value: unknown): boolean | null {
    if (typeof value === 'boolean') {
        return value;
    }
    return null;
}

function normalizeDistricts(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.map((entry) => String(entry).trim()).filter((entry) => entry.length > 0);
}

function matchesPreferences(listing: ListingCandidate, pref: TenantPreferenceRow): boolean {
    if (pref.minRooms !== null) {
        if (listing.rooms === null || listing.rooms < pref.minRooms) {
            return false;
        }
    }

    if (pref.maxRooms !== null) {
        if (listing.rooms === null || listing.rooms > pref.maxRooms) {
            return false;
        }
    }

    if (pref.minAreaM2 !== null) {
        if (listing.areaM2 === null || listing.areaM2 < pref.minAreaM2) {
            return false;
        }
    }

    if (pref.maxColdRent !== null) {
        if (listing.coldRentAmount === null || listing.coldRentAmount > pref.maxColdRent) {
            return false;
        }
    }

    if (pref.maxWarmRent !== null) {
        if (listing.warmRentAmount === null || listing.warmRentAmount > pref.maxWarmRent) {
            return false;
        }
    }

    if (pref.wbsRequired !== null) {
        if (listing.isWBSRequired === null || listing.isWBSRequired !== pref.wbsRequired) {
            return false;
        }
    }

    if (pref.preferredDistricts.length > 0) {
        if (listing.address === null) {
            return false;
        }

        const addressLower = listing.address.toLowerCase();
        const hasDistrictMatch = pref.preferredDistricts.some((district) =>
            addressLower.includes(district.toLowerCase()),
        );

        if (!hasDistrictMatch) {
            return false;
        }
    }

    return true;
}

async function getTenantPreferences(): Promise<TenantPreferenceRow[]> {
    const db = getDbRo();
    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`
      SELECT
        tp."tenantId" AS "tenantId",
        t."name" AS "tenantName",
        t."email" AS "tenantEmail",
        t."whatsappNumber" AS "tenantWhatsappNumber",
        tp."minRooms" AS "minRooms",
        tp."maxRooms" AS "maxRooms",
        tp."minAreaM2" AS "minAreaM2",
        tp."maxColdRent" AS "maxColdRent",
        tp."maxWarmRent" AS "maxWarmRent",
        tp."wbsRequired" AS "wbsRequired",
        tp."preferredDistricts" AS "preferredDistricts"
      FROM "TenantPreference" tp
      INNER JOIN "Tenant" t ON t."id" = tp."tenantId"
    `,
    );

    return rows.map((row) => ({
        tenantId: String(row.tenantId),
        tenantName: String(row.tenantName),
        tenantEmail: row.tenantEmail === null || row.tenantEmail === undefined ? null : String(row.tenantEmail),
        tenantWhatsappNumber:
            row.tenantWhatsappNumber === null || row.tenantWhatsappNumber === undefined
                ? null
                : String(row.tenantWhatsappNumber),
        minRooms: toNumber(row.minRooms),
        maxRooms: toNumber(row.maxRooms),
        minAreaM2: toNumber(row.minAreaM2),
        maxColdRent: toNumber(row.maxColdRent),
        maxWarmRent: toNumber(row.maxWarmRent),
        wbsRequired: toBoolean(row.wbsRequired),
        preferredDistricts: normalizeDistricts(row.preferredDistricts),
    }));
}

export async function processListingAlerts(
    listings: ListingCandidate[],
    logger: Logger,
): Promise<ListingAlertRunSummary> {
    const summary: ListingAlertRunSummary = {
        newListings: listings.length,
        matchedTenants: 0,
        channelsCreated: 0,
        channelsSent: 0,
        channelsFailed: 0,
        channelsSkippedDuplicate: 0,
    };

    if (listings.length === 0) {
        return summary;
    }

    const preferences = await getTenantPreferences();
    if (preferences.length === 0) {
        return summary;
    }

    for (const listing of listings) {
        for (const pref of preferences) {
            if (!matchesPreferences(listing, pref)) {
                continue;
            }

            summary.matchedTenants += 1;

            try {
                const result = await notifyListingAlert({
                    tenantId: pref.tenantId,
                    tenantName: pref.tenantName,
                    tenantEmail: pref.tenantEmail,
                    tenantWhatsappNumber: pref.tenantWhatsappNumber,
                    listingId: listing.id,
                    listingTitle: listing.title,
                    listingUrl: listing.listingUrl,
                });

                summary.channelsCreated += result.channelsCreated;
                summary.channelsSent += result.channelsSent;
                summary.channelsFailed += result.channelsFailed;
                summary.channelsSkippedDuplicate += result.channelsSkippedDuplicate;
            } catch (error) {
                logger.error(
                    { tenantId: pref.tenantId, listingId: listing.id, error },
                    'Failed to process listing alert',
                );
            }
        }
    }

    return summary;
}
