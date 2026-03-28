import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import healthRoutes from './api/health/health.routes';
import listingsRoutes from './api/listings/listings.routes';
import scraperRoutes from './api/scraper/scraper.routes';
import waitlistRoutes from './api/waitlist/waitlist.routes';
import { scraperSchedulerPlugin } from './features/scraper/scraper-scheduler.plugin';
import { sharedMiddleware } from './shared/middleware/index';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  // CORS — allow frontend origins
  await app.register(cors, { origin: true });

  // Cross-cutting middleware: request ID, response time
  app.register(sharedMiddleware);

  // Scheduler plugin: registers @fastify/schedule + wires up cron jobs for all scrapers
  await app.register(scraperSchedulerPlugin);

  // API routes
  await app.register(healthRoutes);
  await app.register(scraperRoutes, { prefix: '/api/v1/scrapers' });
  await app.register(listingsRoutes, { prefix: '/api/v1/listings' });
  await app.register(waitlistRoutes, { prefix: '/api/v1/waitlist' });

  return app;
}
