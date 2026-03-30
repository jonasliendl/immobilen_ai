import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
    createTenant,
    getTenantById,
    updateTenant,
    deleteTenant,
    upsertPreferences,
    getPreferences,
    createApplication,
    getApplicationsByTenant,
} from '../../features/tenants/tenants.service';
import {
    getNotificationsByTenant,
    notifyApplicationSubmitted,
} from '../../features/notifications/notifications.service';
import { runAutoApplyForEnabledTenants, runAutoApplyForTenant } from '../../features/applicator/applicator.service';
import {
    CreateTenantSchema,
    UpdateTenantSchema,
    UpsertPreferencesSchema,
    CreateApplicationSchema,
    RunAutoApplyBatchSchema,
    RunAutoApplySchema,
} from '../../features/tenants/tenants.types';

// ─── Auth stub (commented out — Phase 1 placeholder) ────────────
//
// import { verifyToken } from '../../shared/middleware/auth';
//
// function getTenantIdFromRequest(request: FastifyRequest): string {
//   const token = request.headers.authorization?.replace('Bearer ', '');
//   if (!token) throw new Error('Unauthorized');
//   const payload = verifyToken(token);
//   return payload.tenantId;
// }
//
// For now, tenantId is passed as a route parameter.

// ─── Tenant CRUD ────────────────────────────────────────────────

export async function createTenantHandler(
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<void> {
    const parsed = CreateTenantSchema.safeParse(request.body);
    if (!parsed.success) {
        await reply.status(400).send({ error: z.treeifyError(parsed.error) });
        return;
    }

    try {
        const tenant = await createTenant(parsed.data);
        await reply.status(201).send({ data: tenant });
    } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('unique constraint')) {
            await reply.status(409).send({ error: 'A tenant with this email already exists' });
            return;
        }
        throw err;
    }
}

export async function getTenantHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<void> {
    const tenant = await getTenantById(request.params.id);
    if (!tenant) {
        await reply.status(404).send({ error: 'Tenant not found' });
        return;
    }
    await reply.send({ data: tenant });
}

export async function updateTenantHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<void> {
    const parsed = UpdateTenantSchema.safeParse(request.body);
    if (!parsed.success) {
        await reply.status(400).send({ error: z.treeifyError(parsed.error) });
        return;
    }

    const tenant = await updateTenant(request.params.id, parsed.data);
    if (!tenant) {
        await reply.status(404).send({ error: 'Tenant not found' });
        return;
    }
    await reply.send({ data: tenant });
}

export async function deleteTenantHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<void> {
    const deleted = await deleteTenant(request.params.id);
    if (!deleted) {
        await reply.status(404).send({ error: 'Tenant not found' });
        return;
    }
    await reply.status(204).send();
}

// ─── Preferences ────────────────────────────────────────────────

export async function upsertPreferencesHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<void> {
    const parsed = UpsertPreferencesSchema.safeParse(request.body);
    if (!parsed.success) {
        await reply.status(400).send({ error: z.treeifyError(parsed.error) });
        return;
    }

    const tenant = await getTenantById(request.params.id);
    if (!tenant) {
        await reply.status(404).send({ error: 'Tenant not found' });
        return;
    }

    const prefs = await upsertPreferences(request.params.id, parsed.data);
    await reply.send({ data: prefs });
}

export async function getPreferencesHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<void> {
    const prefs = await getPreferences(request.params.id);
    if (!prefs) {
        await reply.status(404).send({ error: 'Preferences not found' });
        return;
    }
    await reply.send({ data: prefs });
}

// ─── Applications ───────────────────────────────────────────────

export async function createApplicationHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<void> {
    const parsed = CreateApplicationSchema.safeParse(request.body);
    if (!parsed.success) {
        await reply.status(400).send({ error: z.treeifyError(parsed.error) });
        return;
    }

    const tenant = await getTenantById(request.params.id);
    if (!tenant) {
        await reply.status(404).send({ error: 'Tenant not found' });
        return;
    }

    const application = await createApplication(request.params.id, parsed.data);

    await notifyApplicationSubmitted({
        tenantId: request.params.id,
        tenantName: String(tenant.name ?? 'Tenant'),
        tenantEmail: tenant.email === null || tenant.email === undefined ? null : String(tenant.email),
        tenantWhatsappNumber:
            tenant.whatsappNumber === null || tenant.whatsappNumber === undefined
                ? null
                : String(tenant.whatsappNumber),
        applicationId: String(application.id),
        listingId: String(application.listingId),
    });

    await reply.status(201).send({ data: application });
}

export async function getApplicationsHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<void> {
    const applications = await getApplicationsByTenant(request.params.id);
    await reply.send({ data: applications });
}

export async function getNotificationsHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<void> {
    const notifications = await getNotificationsByTenant(request.params.id);
    await reply.send({ data: notifications });
}

export async function runAutoApplyHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<void> {
    const parsed = RunAutoApplySchema.safeParse(request.body ?? {});
    if (!parsed.success) {
        await reply.status(400).send({ error: z.treeifyError(parsed.error) });
        return;
    }

    const result = await runAutoApplyForTenant(request.params.id, {
        maxListings: parsed.data.maxListings,
        dryRun: parsed.data.dryRun,
    });
    if (!result) {
        await reply.status(404).send({ error: 'Tenant not found' });
        return;
    }

    await reply.send({ data: result });
}

export async function runAutoApplyBatchHandler(
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<void> {
    const parsed = RunAutoApplyBatchSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
        await reply.status(400).send({ error: z.treeifyError(parsed.error) });
        return;
    }

    const summary = await runAutoApplyForEnabledTenants({
        maxListings: parsed.data.maxListings,
        dryRun: parsed.data.dryRun,
    });

    await reply.send({ data: summary });
}
