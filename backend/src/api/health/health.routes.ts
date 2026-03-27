import type { FastifyPluginCallback } from 'fastify';
import type { HealthStatus } from '../../features/health/health.types';
import { getHealthHandler } from './health.controller';

const healthRoutes: FastifyPluginCallback = (app, _options, done): void => {
  app.get<{ Reply: HealthStatus }>('/health', getHealthHandler);
  done();
};

export default healthRoutes;
