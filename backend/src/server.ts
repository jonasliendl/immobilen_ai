import 'dotenv/config';
import { buildApp } from './app';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST ?? 'localhost';

async function main(): Promise<void> {
  const app = await buildApp();
  await app.listen({ port: PORT, host: HOST });
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
  process.exit(1);
});
