import type { FastifyPluginCallback } from 'fastify';
import {
    createTenantHandler,
    getTenantHandler,
    updateTenantHandler,
    deleteTenantHandler,
    upsertPreferencesHandler,
    getPreferencesHandler,
    createApplicationHandler,
    getApplicationsHandler,
    getNotificationsHandler,
    runAutoApplyBatchHandler,
    runAutoApplyHandler,
} from './tenants.controller';

const tenantsRoutes: FastifyPluginCallback = (app, _options, done): void => {
    // ─── Auth hook (commented out — Phase 1 placeholder) ──────────
    //
    // app.addHook('preHandler', async (request, reply) => {
    //   const token = request.headers.authorization?.replace('Bearer ', '');
    //   if (!token) {
    //     await reply.status(401).send({ error: 'Unauthorized' });
    //     return;
    //   }
    //   try {
    //     request.tenantPayload = verifyToken(token);
    //   } catch {
    //     await reply.status(401).send({ error: 'Invalid token' });
    //   }
    // });

    // Auto-apply batch route must be registered before dynamic :id routes.
    app.post('/auto-apply/run', runAutoApplyBatchHandler);

    // Tenant CRUD
    app.post('/', createTenantHandler);
    app.get<{ Params: { id: string } }>('/:id', getTenantHandler);
    app.patch<{ Params: { id: string } }>('/:id', updateTenantHandler);
    app.delete<{ Params: { id: string } }>('/:id', deleteTenantHandler);

    // Tenant preferences
    app.get<{ Params: { id: string } }>('/:id/preferences', getPreferencesHandler);
    app.put<{ Params: { id: string } }>('/:id/preferences', upsertPreferencesHandler);

    // Tenant applications
    app.get<{ Params: { id: string } }>('/:id/applications', getApplicationsHandler);
    app.post<{ Params: { id: string } }>('/:id/applications', createApplicationHandler);

    // Tenant notifications
    app.get<{ Params: { id: string } }>('/:id/notifications', getNotificationsHandler);

    // Auto-apply agent (Phase 4)
    app.post<{ Params: { id: string } }>('/:id/auto-apply/run', runAutoApplyHandler);

    done();
};

export default tenantsRoutes;
