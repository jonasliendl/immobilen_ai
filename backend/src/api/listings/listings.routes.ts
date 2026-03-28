import type { FastifyPluginCallback } from 'fastify';
import { getListingByIdHandler, getListingsHandler } from './listings.controller';

const listingsRoutes: FastifyPluginCallback = (app, _options, done): void => {
  app.get('/', getListingsHandler);
  app.get<{ Params: { id: string } }>('/:id', getListingByIdHandler);
  done();
};

export default listingsRoutes;
