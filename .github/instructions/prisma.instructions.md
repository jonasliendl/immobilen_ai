---
applyTo: "backend/src/database/**"
---

# Prisma & Database Instructions

## Schema

Located at `backend/src/database/schema.prisma`. Uses PostgreSQL with `@prisma/adapter-pg`.

### Key Models

- **Listing** — 25+ fields covering rental property data (rent, area, rooms, address, energy, features). Unique constraint on `(source, sourceListingId)` for upsert.
- **ScraperJob** — Tracks scraper executions with status enum (`RUNNING`, `SUCCESS`, `FAILED`), timing, and counts.

## Database Clients

- `client.ts` — Read-write client for mutations (upserts, inserts, job tracking)
- `client-ro.ts` — Read-only client for queries (listings API, job history)

## Query Pattern

Use raw SQL with `Prisma.sql` template literals instead of Prisma Client query builder:

```ts
import { Prisma } from '@prisma/client';
import { prisma } from '../database/client';

const listings = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM "Listing" WHERE "city" = ${city} LIMIT ${limit}`
);
```

Always quote table and column names with double quotes (PostgreSQL convention for case-sensitive identifiers).

## Schema Changes

During development:
```sh
npm run db:push    # Push schema directly (no migration file)
```

For production:
```sh
npm run db:migrate  # Generate and apply migration
```

## Conventions

- Never use Prisma Client's fluent query API — always raw SQL
- Use parameterized queries (`Prisma.sql`) — never string interpolation for SQL
- Use the read-only client for GET endpoints, read-write for mutations
- Table names match model names exactly (PascalCase, e.g., `"Listing"`)
