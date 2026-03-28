# Backend Guidelines

## Stack

Fastify 5 + TypeScript (CommonJS, ES2020 target). PostgreSQL via Prisma 7 with `@prisma/adapter-pg`. Playwright for browser-based scrapers, Cheerio for static scrapers.

## Architecture

```
src/
  api/{feature}/          ← HTTP layer: .routes.ts + .controller.ts
  features/{feature}/     ← Business logic: .service.ts + .types.ts
  database/               ← Prisma schema, migration, read-only & read-write clients
  shared/middleware/       ← Error handler, request logging
  shared/utils/           ← Helpers (slugify, retry, etc.)
```

### Route Registration

Routes are Fastify plugins registered in `src/app.ts`. Each route file exports a default async function:

```ts
export default async function (app: FastifyInstance) {
  app.get('/api/v1/listings', getListingsHandler);
}
```

### Controller Pattern

Controllers receive `(request, reply)` and handle validation + response:

```ts
export async function getListingsHandler(request: FastifyRequest, reply: FastifyReply) {
  const result = schema.safeParse(request.query);
  if (!result.success) {
    return reply.status(400).send({ error: treeifyError(result.error) });
  }
  const data = await listingsService.getAll(result.data);
  return reply.send(data);
}
```

### Service Pattern

Services are pure business logic. They receive validated input and return data. DB access uses raw SQL:

```ts
const listings = await prisma.$queryRaw(Prisma.sql`SELECT * FROM "Listing" LIMIT ${limit}`);
```

## Validation

Use Zod v4 for all request validation. Always use `safeParse` (never `parse`). Format errors with `treeifyError`:

```ts
import { z, treeifyError } from 'zod/v4';
```

## Database

- Schema at `src/database/schema.prisma`
- Two clients: `client.ts` (read-write) and `client-ro.ts` (read-only)
- Config at root `prisma.config.ts`
- Prefer raw SQL with `Prisma.sql` over Prisma Client query builder
- Run `npm run db:push` to sync schema changes during development
- Run `npm run db:migrate` for production migration creation

## Scraper System

Scrapers implement `ScraperInterface` (see `features/scraper/scraper.types.ts`):

- `sourceId` — unique identifier (e.g., `"in-berlin-wohnen"`)
- `scheduleCron` — cron expression for automatic runs
- `scrape()` — fetch raw data
- `transform()` — convert raw → `StandardListing`
- `validate()` — filter invalid listings

Two base classes: `BaseBrowserScraper` (Playwright) and `BaseStaticScraper` (Cheerio/fetch).

Register new scrapers in `features/scraper/scraper.registry.ts`.

## Error Handling

- Controllers return structured `{ error }` responses with appropriate HTTP status codes
- Services throw errors which are caught by the shared error handler middleware
- Never expose internal error details to clients in production

## Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with ts-node |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run Vitest tests |
| `npm run start:db` | Start PostgreSQL Docker container |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create and run migration |
| `npm run db:reset` | Reset database |
| `npm run lint:fix` | ESLint with auto-fix |
