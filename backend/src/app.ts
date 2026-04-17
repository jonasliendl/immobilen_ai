import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import scraperRoutes from './api/scraper/scraper.routes';
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

  // API routes — scraper trigger only; all other endpoints are served by the Next.js frontend
  await app.register(scraperRoutes, { prefix: '/api/v1/scrapers' });

  return app;
}
