import type { FastifyPluginCallback } from 'fastify';
import fastifySchedule from '@fastify/schedule';
import { AsyncTask, CronJob } from 'toad-scheduler';
import { runScraper } from './scraper.service';
import { scraperRegistry } from './scraper.registry';

export const scraperSchedulerPlugin: FastifyPluginCallback = (app, _options, done): void => {
  // @fastify/schedule uses fastify-plugin internally, so app.scheduler is decorated
  // on the root scope and becomes available after this plugin resolves.
  app.register(fastifySchedule);

  // app.after() fires after all plugins in the current batch have resolved,
  // guaranteeing app.scheduler is set when the loop runs.
  app.after(() => {
    for (const scraper of scraperRegistry) {
      const task = new AsyncTask(
        `scraper-${scraper.sourceId}`,
        async (): Promise<void> => {
          const result = await runScraper(scraper, app.log);
          app.log.info({ sourceId: scraper.sourceId, result }, 'Scheduled scrape complete');
        },
        (error: Error): void => {
          app.log.error({ sourceId: scraper.sourceId, error }, 'Scheduled scrape error');
        },
      );

      app.scheduler.addCronJob(
        new CronJob({ cronExpression: scraper.scheduleCron }, task, {
          id: `scraper-cron-${scraper.sourceId}`,
        }),
      );
    }
  });

  done();
};
