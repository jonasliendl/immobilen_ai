import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import healthRoutes from './api/health/health.routes';
import scraperRoutes from './api/scraper/scraper.routes';
import { scraperSchedulerPlugin } from './features/scraper/scraper-scheduler.plugin';
import { sharedMiddleware } from './shared/middleware/index';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  // Cross-cutting middleware: request ID, response time
  app.register(sharedMiddleware);

  // Scheduler plugin: registers @fastify/schedule + wires up cron jobs for all scrapers
  await app.register(scraperSchedulerPlugin);

  // API routes
  await app.register(healthRoutes);
  await app.register(scraperRoutes, { prefix: '/api/v1/scrapers' });

  return app;
}
