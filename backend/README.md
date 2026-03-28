# Backend — Local Dev Setup

A Fastify + TypeScript API with a Playwright-based scraper and PostgreSQL via Prisma.

## Prerequisites

- **Node.js** >= 21.0.0
- **Docker** (for the local database)

## Quick Start

```bash
# 1. Install dependencies (also installs Playwright Chromium)
npm install

# 2. Set up environment variables
cp .env.template .env

# 3. Start the database
npm run start:db

# 4. Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# 5. Start the dev server
npm run dev
```

The server runs at `http://localhost:8080`.

## Environment Variables

Copy `.env.template` to `.env`. The defaults work out of the box with the Docker database:

| Variable            | Default                                             | Description                    |
|---------------------|-----------------------------------------------------|--------------------------------|
| `HOST`              | `localhost`                                         | Server bind host               |
| `PORT`              | `8080`                                              | Server port                    |
| `POSTGRES_USER`     | `immos_user`                                        | Postgres username               |
| `POSTGRES_PASSWORD` | `immos_pass`                                        | Postgres password               |
| `DATABASE_URL`      | `postgresql://immos_user:immos_pass@localhost:5432/immos` | Read-write connection string |
| `DATABASE_URL_RO`   | `postgresql://immos_user:immos_pass@localhost:5432/immos` | Read-only connection string  |

## Database

The local database runs in Docker:

```bash
npm run start:db     # Start Postgres container
npm run db:migrate   # Apply pending migrations
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:reset     # Wipe and re-migrate (destructive)
```

The schema lives at `src/database/schema.prisma`. Migrations are stored in `src/database/migrations/`.

## Project Structure

```
src/
├── server.ts                   # Entry point
├── app.ts                      # Fastify app factory (buildApp)
│
├── api/                        # Route definitions and HTTP handlers
│   ├── health/
│   ├── listings/
│   └── scraper/
│
├── features/                   # Business logic (services + types)
│   ├── health/
│   ├── listings/
│   └── scraper/                # Scraper engine, scheduler, registry
│       └── scrapers/           # Individual scraper implementations
│
├── database/                   # Prisma clients and migrations
│   ├── client.ts               # Read-write singleton
│   ├── client-ro.ts            # Read-only singleton
│   └── migrations/
│
└── shared/                     # Middleware, shared types, utilities
```

All API routes are mounted under `/api/v1/`.

## Key Scripts

| Script           | Description                            |
|------------------|----------------------------------------|
| `npm run dev`    | Run in dev mode with `ts-node`         |
| `npm run build`  | Compile TypeScript to `dist/`          |
| `npm start`      | Run compiled output                    |
| `npm run lint`   | ESLint check                           |
| `npm run lint:fix` | ESLint with auto-fix                 |
| `npm run format` | Prettier format                        |

## Adding a Scraper

1. Create a new file in `src/features/scraper/scrapers/`.
2. Extend `BaseStaticScraper` (for HTML scrapers) or `BaseBrowserScraper` (for Playwright-based scrapers).
3. Register it in `src/features/scraper/scraper.registry.ts`.

See `src/features/scraper/scrapers/in-berlin-wohnen.scraper.ts` for a real example and `example-static.scraper.ts` for a minimal template.

## Code Style

- **TypeScript strict mode** — no `any`, explicit return types required.
- **ESLint** enforces security and modern JS conventions.
- **Prettier** with 100-char print width and single quotes.

Run both before committing:

```bash
npm run lint:fix
npm run format
```
