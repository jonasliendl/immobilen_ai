import type { FastifyPluginCallback } from 'fastify';
import { triggerScraperHandler } from './scraper.controller';

const scraperRoutes: FastifyPluginCallback = (app, _options, done): void => {
  app.post<{ Params: { sourceId: string } }>('/:sourceId/run', triggerScraperHandler);

  done();
};

export default scraperRoutes;
