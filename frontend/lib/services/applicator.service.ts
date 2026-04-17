import { Prisma } from '@prisma/client';
import { getDb } from '../db';
import { getDbRo } from '../db-ro';
import { notifyApplicationSubmitted } from './notifications.service';
import { pickApplicator } from './applicator.registry';
import type { AutoApplyBatchRunResult, AutoApplyRunResult } from './applicator.types';

interface RunAutoApplyOptions {
    maxListings: number;
    dryRun: boolean;
}

interface AutoApplyContext {
    tenantId: string;
    tenantName: string;
    tenantEmail: string | null;
    tenantWhatsappNumber: string | null;
    autoApplyEnabled: boolean;
    minRooms: number | null;
    maxRooms: number | null;
    minAreaM2: number | null;
    maxColdRent: number | null;
    maxWarmRent: number | null;
    wbsRequired: boolean | null;
    preferredDistricts: string[];
}

interface ListingRow {
    id: string;
    source: string;
    title: string;
    listingUrl: string;
}

function toNumber(value: unknown): number | null {
    if (value === null || value === undefined) {
        return null;
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

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.map((entry) => String(entry).trim()).filter((entry) => entry.length > 0);
}

async function getAutoApplyContext(tenantId: string): Promise<AutoApplyContext | null> {
    const db = getDbRo();
    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`
      SELECT
        t."id" AS "tenantId",
        t."name" AS "tenantName",
        t."email" AS "tenantEmail",
        t."whatsappNumber" AS "tenantWhatsappNumber",
        tp."autoApplyEnabled" AS "autoApplyEnabled",
        tp."minRooms" AS "minRooms",
        tp."maxRooms" AS "maxRooms",
        tp."minAreaM2" AS "minAreaM2",
        tp."maxColdRent" AS "maxColdRent",
        tp."maxWarmRent" AS "maxWarmRent",
        tp."wbsRequired" AS "wbsRequired",
        tp."preferredDistricts" AS "preferredDistricts"
      FROM "Tenant" t
      LEFT JOIN "TenantPreference" tp ON tp."tenantId" = t."id"
      WHERE t."id" = ${tenantId}
      LIMIT 1
    `,
    );

    const row = rows[0];
    if (!row) {
        return null;
    }

    return {
        tenantId: String(row.tenantId),
        tenantName: String(row.tenantName),
        tenantEmail: row.tenantEmail === null || row.tenantEmail === undefined ? null : String(row.tenantEmail),
        tenantWhatsappNumber:
            row.tenantWhatsappNumber === null || row.tenantWhatsappNumber === undefined
                ? null
                : String(row.tenantWhatsappNumber),
        autoApplyEnabled: row.autoApplyEnabled === true,
        minRooms: toNumber(row.minRooms),
        maxRooms: toNumber(row.maxRooms),
        minAreaM2: toNumber(row.minAreaM2),
        maxColdRent: toNumber(row.maxColdRent),
        maxWarmRent: toNumber(row.maxWarmRent),
        wbsRequired: toBoolean(row.wbsRequired),
        preferredDistricts: toStringArray(row.preferredDistricts),
    };
}

async function getEnabledTenantIds(): Promise<string[]> {
    const db = getDbRo();
    const rows = await db.$queryRaw<Array<{ tenantId: string }>>(
        Prisma.sql`
            SELECT "tenantId"
            FROM "TenantPreference"
            WHERE "autoApplyEnabled" = true
            ORDER BY "tenantId" ASC
        `,
    );

    return rows.map((row) => row.tenantId);
}

function buildListingWhere(ctx: AutoApplyContext): Prisma.Sql {
    const conditions: Prisma.Sql[] = [Prisma.sql`l."isValid" = true`];

    if (ctx.minRooms !== null) {
        conditions.push(Prisma.sql`l."rooms" >= ${ctx.minRooms}`);
    }
    if (ctx.maxRooms !== null) {
        conditions.push(Prisma.sql`l."rooms" <= ${ctx.maxRooms}`);
    }
    if (ctx.minAreaM2 !== null) {
        conditions.push(Prisma.sql`l."areaM2" >= ${ctx.minAreaM2}`);
    }
    if (ctx.maxColdRent !== null) {
        conditions.push(Prisma.sql`l."coldRentAmount" <= ${ctx.maxColdRent}`);
    }
    if (ctx.maxWarmRent !== null) {
        conditions.push(Prisma.sql`l."warmRentAmount" <= ${ctx.maxWarmRent}`);
    }
    if (ctx.wbsRequired !== null) {
        conditions.push(Prisma.sql`l."isWBSRequired" = ${ctx.wbsRequired}`);
    }
    if (ctx.preferredDistricts.length > 0) {
        const districtConditions = ctx.preferredDistricts.map(
            (district) => Prisma.sql`COALESCE(l."address", '') ILIKE ${`%${district}%`}`,
        );
        conditions.push(Prisma.sql`(${Prisma.join(districtConditions, ' OR ')})`);
    }

    return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
}

async function getCandidateListings(ctx: AutoApplyContext, limit: number): Promise<ListingRow[]> {
    const db = getDbRo();
    const whereClause = buildListingWhere(ctx);

    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`
      SELECT l."id", l."source", l."title", l."listingUrl"
      FROM "Listing" l
      ${whereClause}
      ORDER BY l."lastSeenAt" DESC
      LIMIT ${limit}
    `,
    );

    return rows.map((row) => ({
        id: String(row.id),
        source: String(row.source),
        title: String(row.title),
        listingUrl: String(row.listingUrl),
    }));
}

async function hasExistingApplication(tenantId: string, listingId: string): Promise<boolean> {
    const db = getDbRo();
    const rows = await db.$queryRaw<Array<{ exists: boolean }>>(
        Prisma.sql`
      SELECT EXISTS (
        SELECT 1
        FROM "Application"
        WHERE "tenantId" = ${tenantId}
          AND "listingId" = ${listingId}
      ) AS "exists"
    `,
    );

    return rows[0]?.exists === true;
}

async function createPendingApplication(tenantId: string, listingId: string) {
    const db = getDb();
    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`
      INSERT INTO "Application" (
        "id", "tenantId", "listingId", "status", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text,
        ${tenantId},
        ${listingId},
        'PENDING',
        NOW(),
        NOW()
      )
      RETURNING *
    `,
    );
    return rows[0];
}

async function markApplicationSubmitted(applicationId: string, externalReference: string | null): Promise<void> {
    const db = getDb();
    await db.$queryRaw(
        Prisma.sql`
      UPDATE "Application"
      SET
        "status" = 'SUBMITTED',
        "submittedAt" = NOW(),
        "responseContent" = ${externalReference},
        "updatedAt" = NOW()
      WHERE "id" = ${applicationId}
    `,
    );
}

async function markApplicationSubmissionFailed(applicationId: string, reason: string): Promise<void> {
    const db = getDb();
    await db.$queryRaw(
        Prisma.sql`
      UPDATE "Application"
      SET
        "responseContent" = ${reason},
        "updatedAt" = NOW()
      WHERE "id" = ${applicationId}
    `,
    );
}

export async function runAutoApplyForTenant(
    tenantId: string,
    options: RunAutoApplyOptions,
): Promise<AutoApplyRunResult | null> {
    const ctx = await getAutoApplyContext(tenantId);
    if (ctx === null) {
        return null;
    }

    const applicatorsUsed = new Set<string>();
    const result: AutoApplyRunResult = {
        tenantId,
        autoApplyEnabled: ctx.autoApplyEnabled,
        dryRun: options.dryRun,
        consideredListings: 0,
        applicationsPlanned: 0,
        applicationsCreated: 0,
        applicationsSubmitted: 0,
        applicationsFailed: 0,
        skippedExisting: 0,
        skippedNoApplicator: 0,
        applicatorsUsed: [],
    };

    if (!ctx.autoApplyEnabled) {
        result.applicatorsUsed = Array.from(applicatorsUsed);
        return result;
    }

    const listings = await getCandidateListings(ctx, options.maxListings);
    result.consideredListings = listings.length;

    for (const listing of listings) {
        const existing = await hasExistingApplication(tenantId, listing.id);
        if (existing) {
            result.skippedExisting += 1;
            continue;
        }

        result.applicationsPlanned += 1;

        const applicator = pickApplicator(listing.source);
        if (applicator === null) {
            result.skippedNoApplicator += 1;
            continue;
        }

        applicatorsUsed.add(applicator.id);

        if (options.dryRun) {
            continue;
        }

        const application = await createPendingApplication(tenantId, listing.id);
        result.applicationsCreated += 1;

        const submitResult = await applicator.submit({
            applicationId: String(application.id),
            tenantId,
            tenantName: ctx.tenantName,
            tenantEmail: ctx.tenantEmail,
            listingId: listing.id,
            listingSource: listing.source,
            listingTitle: listing.title,
            listingUrl: listing.listingUrl,
            coverLetter: null,
            dryRun: false,
        });

        if (submitResult.success) {
            await markApplicationSubmitted(String(application.id), submitResult.externalReference ?? null);
            result.applicationsSubmitted += 1;

            await notifyApplicationSubmitted({
                tenantId,
                tenantName: ctx.tenantName,
                tenantEmail: ctx.tenantEmail,
                tenantWhatsappNumber: ctx.tenantWhatsappNumber,
                applicationId: String(application.id),
                listingId: listing.id,
            });
        } else {
            await markApplicationSubmissionFailed(
                String(application.id),
                submitResult.error ?? 'APPLICATION_SUBMISSION_FAILED',
            );
            result.applicationsFailed += 1;
        }
    }

    result.applicatorsUsed = Array.from(applicatorsUsed);

    return result;
}

export async function runAutoApplyForEnabledTenants(
    options: RunAutoApplyOptions,
): Promise<AutoApplyBatchRunResult> {
    const tenantIds = await getEnabledTenantIds();

    const summary: AutoApplyBatchRunResult = {
        dryRun: options.dryRun,
        tenantsConsidered: tenantIds.length,
        tenantsProcessed: 0,
        tenantsSkippedDisabled: 0,
        totalConsideredListings: 0,
        totalApplicationsPlanned: 0,
        totalApplicationsCreated: 0,
        totalApplicationsSubmitted: 0,
        totalApplicationsFailed: 0,
        perTenant: [],
    };

    for (const tenantId of tenantIds) {
        const result = await runAutoApplyForTenant(tenantId, options);
        if (result === null) {
            continue;
        }

        summary.tenantsProcessed += 1;
        if (!result.autoApplyEnabled) {
            summary.tenantsSkippedDisabled += 1;
        }

        summary.totalConsideredListings += result.consideredListings;
        summary.totalApplicationsPlanned += result.applicationsPlanned;
        summary.totalApplicationsCreated += result.applicationsCreated;
        summary.totalApplicationsSubmitted += result.applicationsSubmitted;
        summary.totalApplicationsFailed += result.applicationsFailed;
        summary.perTenant.push(result);
    }

    return summary;
}
