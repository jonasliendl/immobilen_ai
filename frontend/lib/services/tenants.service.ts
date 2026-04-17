import { Prisma } from '@prisma/client';
import { getDb } from '../db';
import { getDbRo } from '../db-ro';
import type {
    CreateTenantInput,
    UpdateTenantInput,
    UpsertPreferencesInput,
    CreateApplicationInput,
} from './tenants.types';

// ─── Tenant CRUD ────────────────────────────────────────────────

export async function createTenant(input: CreateTenantInput) {
    const db = getDb();
    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`
      INSERT INTO "Tenant" ("id", "email", "name", "phone", "whatsappNumber",
        "monthlyNetIncomeEur", "householdSize", "hasPets", "hasSchufa", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid()::text,
        ${input.email},
        ${input.name},
        ${input.phone ?? null},
        ${input.whatsappNumber ?? null},
        ${input.monthlyNetIncomeEur ?? null},
        ${input.householdSize},
        ${input.hasPets},
        ${input.hasSchufa},
        NOW(), NOW()
      )
      RETURNING *
    `,
    );
    return rows[0];
}

export async function getTenantById(id: string) {
    const db = getDbRo();
    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`SELECT * FROM "Tenant" WHERE "id" = ${id}`,
    );
    return rows[0] ?? null;
}

export async function getTenantByEmail(email: string) {
    const db = getDbRo();
    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`SELECT * FROM "Tenant" WHERE "email" = ${email}`,
    );
    return rows[0] ?? null;
}

export async function updateTenant(id: string, input: UpdateTenantInput) {
    const db = getDb();
    const setClauses: Prisma.Sql[] = [Prisma.sql`"updatedAt" = NOW()`];

    if (input.email !== undefined) setClauses.push(Prisma.sql`"email" = ${input.email}`);
    if (input.name !== undefined) setClauses.push(Prisma.sql`"name" = ${input.name}`);
    if (input.phone !== undefined) setClauses.push(Prisma.sql`"phone" = ${input.phone}`);
    if (input.whatsappNumber !== undefined)
        setClauses.push(Prisma.sql`"whatsappNumber" = ${input.whatsappNumber}`);
    if (input.monthlyNetIncomeEur !== undefined)
        setClauses.push(Prisma.sql`"monthlyNetIncomeEur" = ${input.monthlyNetIncomeEur}`);
    if (input.householdSize !== undefined)
        setClauses.push(Prisma.sql`"householdSize" = ${input.householdSize}`);
    if (input.hasPets !== undefined) setClauses.push(Prisma.sql`"hasPets" = ${input.hasPets}`);
    if (input.hasSchufa !== undefined)
        setClauses.push(Prisma.sql`"hasSchufa" = ${input.hasSchufa}`);

    const setClause = Prisma.join(setClauses, ', ');
    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`UPDATE "Tenant" SET ${setClause} WHERE "id" = ${id} RETURNING *`,
    );
    return rows[0] ?? null;
}

export async function deleteTenant(id: string): Promise<boolean> {
    const db = getDb();
    const rows = await db.$queryRaw<Array<{ id: string }>>(
        Prisma.sql`DELETE FROM "Tenant" WHERE "id" = ${id} RETURNING "id"`,
    );
    return rows.length > 0;
}

// ─── Preferences ────────────────────────────────────────────────

export async function upsertPreferences(tenantId: string, input: UpsertPreferencesInput) {
    const db = getDb();

    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`
      INSERT INTO "TenantPreference" ("id", "tenantId", "minRooms", "maxRooms", "maxColdRent", "maxWarmRent",
        "minAreaM2", "preferredDistricts", "wbsRequired", "autoApplyEnabled")
      VALUES (
        gen_random_uuid()::text,
        ${tenantId},
        ${input.minRooms ?? null},
        ${input.maxRooms ?? null},
        ${input.maxColdRent ?? null},
        ${input.maxWarmRent ?? null},
        ${input.minAreaM2 ?? null},
        ${input.preferredDistricts},
        ${input.wbsRequired ?? null},
        ${input.autoApplyEnabled}
      )
      ON CONFLICT ("tenantId") DO UPDATE SET
        "minRooms" = EXCLUDED."minRooms",
        "maxRooms" = EXCLUDED."maxRooms",
        "maxColdRent" = EXCLUDED."maxColdRent",
        "maxWarmRent" = EXCLUDED."maxWarmRent",
        "minAreaM2" = EXCLUDED."minAreaM2",
        "preferredDistricts" = EXCLUDED."preferredDistricts",
        "wbsRequired" = EXCLUDED."wbsRequired",
        "autoApplyEnabled" = EXCLUDED."autoApplyEnabled"
      RETURNING *
    `,
    );
    return rows[0];
}

export async function getPreferences(tenantId: string) {
    const db = getDbRo();
    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`SELECT * FROM "TenantPreference" WHERE "tenantId" = ${tenantId}`,
    );
    return rows[0] ?? null;
}

// ─── Applications ───────────────────────────────────────────────

export async function createApplication(tenantId: string, input: CreateApplicationInput) {
    const db = getDb();
    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`
      INSERT INTO "Application" ("id", "tenantId", "listingId", "coverLetter",
        "status", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid()::text,
        ${tenantId},
        ${input.listingId},
        ${input.coverLetter ?? null},
        'PENDING',
        NOW(), NOW()
      )
      RETURNING *
    `,
    );
    return rows[0];
}

export async function getApplicationsByTenant(tenantId: string) {
    const db = getDbRo();
    return db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`
      SELECT * FROM "Application"
      WHERE "tenantId" = ${tenantId}
      ORDER BY "createdAt" DESC
    `,
    );
}

export async function getApplicationById(id: string) {
    const db = getDbRo();
    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`SELECT * FROM "Application" WHERE "id" = ${id}`,
    );
    return rows[0] ?? null;
}
