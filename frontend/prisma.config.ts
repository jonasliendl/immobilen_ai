import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

config(); // loads .env into process.env

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

export default defineConfig({
  schema: 'src/database/schema.prisma',
  datasource: { url },
});
