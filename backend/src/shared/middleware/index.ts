import { performance } from 'node:perf_hooks';
import type { FastifyPluginCallback } from 'fastify';

const requestStartTimes = new WeakMap<object, number>();

export const sharedMiddleware: FastifyPluginCallback = (app, _options, done): void => {
  app.addHook('onRequest', (request, reply, hookDone) => {
    if (!reply.hasHeader('x-request-id')) {
      reply.header('x-request-id', request.id);
    }
    requestStartTimes.set(request.raw, performance.now());
    hookDone();
  });

  app.addHook('onSend', (request, reply, payload, hookDone) => {
    const start = requestStartTimes.get(request.raw);
    if (start !== undefined) {
      reply.header('x-response-time', `${(performance.now() - start).toFixed(2)}ms`);
    }

    hookDone(null, payload);
  });

  done();
};
