import type { FastifyPluginCallback } from 'fastify';
import {
  getWaitlistStatsHandler,
  postWaitlistQrOpenHandler,
  postWaitlistSignupHandler,
} from './waitlist.controller';

const waitlistRoutes: FastifyPluginCallback = (app, _options, done): void => {
  app.post('/', postWaitlistSignupHandler);
  app.post('/qr-open', postWaitlistQrOpenHandler);
  app.get('/stats', getWaitlistStatsHandler);
  done();
};

export default waitlistRoutes;
