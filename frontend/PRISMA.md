# Prisma Guide

This project uses **Prisma 7** with the `@prisma/adapter-pg` driver adapter. The single source of truth for the database connection is `DATABASE_URL` in `.env`.

## Setup

Add to `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/immos
```

That's it. The same URL is used by the CLI (migrations, studio) and the runtime client.

> **Note:** `prisma.config.ts` calls `dotenv`'s `config()` to load `.env` before Prisma reads the connection string. The Prisma CLI does not auto-load `.env` in v7.

## How it works

| Layer | File | Role |
|---|---|---|
| Schema | `src/database/schema.prisma` | Model definitions |
| CLI config | `prisma.config.ts` | Provides `DATABASE_URL` to migrate engine via `PrismaPg` adapter |
| Runtime (RW) | `lib/db.ts` | `getDb()` — full read/write client |
| Runtime (RO) | `lib/db-ro.ts` | `getDbRo()` — falls back to `DATABASE_URL` if `DATABASE_URL_RO` is not set |

## Scripts

| Script | Command | When to use |
|---|---|---|
| `npm run db:generate` | `prisma generate` | After changing the schema — regenerates the client |
| `npm run db:push` | `prisma db push` | Quick schema sync without a migration file (dev only) |
| `npm run db:migrate` | `prisma migrate dev` | Create a named migration and apply it (dev) |
| `npm run db:migrate:prod` | `prisma migrate deploy` | Apply pending migrations in production/CI |
| `npm run db:migrate:reset` | `prisma migrate reset` | Drop and recreate the DB, replay all migrations (dev only) |
| `npm run db:status` | `prisma migrate status` | Show which migrations are applied vs pending |
| `npm run db:studio` | `prisma studio` | Open the visual database browser at localhost:5555 |
| `npm run db:format` | `prisma format` | Auto-format `schema.prisma` |

## Typical workflows

**First-time setup**
```bash
# 1. Set DATABASE_URL in .env
# 2. Apply all migrations
npm run db:migrate:prod
# 3. Generate the client
npm run db:generate
```

**Adding a new model or field**
```bash
# 1. Edit src/database/schema.prisma
# 2. Create and apply the migration
npm run db:migrate
# (Prisma prompts for a migration name)
# 3. Regenerate the client
npm run db:generate
```

**Inspecting the database**
```bash
npm run db:studio
# Opens http://localhost:5555
```

**Checking migration state (CI / production)**
```bash
npm run db:status
npm run db:migrate:prod
```

## Read-only replica (optional)

Set `DATABASE_URL_RO` to a separate read replica. `getDbRo()` in `lib/db-ro.ts` will use it automatically; if unset it falls back to `DATABASE_URL`.

```
DATABASE_URL=postgresql://user:pass@primary:5432/immos
DATABASE_URL_RO=postgresql://user:pass@replica:5432/immos
```
