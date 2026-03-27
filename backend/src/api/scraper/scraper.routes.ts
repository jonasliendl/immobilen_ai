import type { FastifyPluginCallback } from 'fastify';
import { getScraperJobsHandler, triggerScraperHandler } from './scraper.controller';

const scraperRoutes: FastifyPluginCallback = (app, _options, done): void => {
  // Static route registered before dynamic param to avoid 'jobs' being treated as sourceId
  app.get('/jobs', getScraperJobsHandler);
  app.post<{ Params: { sourceId: string } }>('/:sourceId/run', triggerScraperHandler);

  done();
};

export default scraperRoutes;
