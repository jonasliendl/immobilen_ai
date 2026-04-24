import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

config(); // loads .env into process.env

const directUrl = process.env.DIRECT_URL;
if (!directUrl) throw new Error('DIRECT_URL is not set');

export default defineConfig({
  schema: 'src/database/schema.prisma',
  datasource: { url: directUrl },
});
