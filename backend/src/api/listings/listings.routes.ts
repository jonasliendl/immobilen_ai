import type { FastifyPluginCallback } from 'fastify';
import {
  getListingByIdHandler,
  getListingMietpreisbremseHandler,
  getListingsHandler,
  syncMietpreisbremseHandler,
} from './listings.controller';

const listingsRoutes: FastifyPluginCallback = (app, _options, done): void => {
  app.get('/', getListingsHandler);
  app.get<{
    Params: { id: string };
    Querystring: Record<string, string | string[]>;
  }>('/:id/mietpreisbremse', getListingMietpreisbremseHandler);
  app.get<{ Params: { id: string } }>('/:id', getListingByIdHandler);
  app.post('/mietpreisbremse/sync', syncMietpreisbremseHandler);
  done();
};

export default listingsRoutes;
