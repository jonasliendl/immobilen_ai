# Budenfinder — Project Guidelines

## Overview

Budenfinder is a Berlin rental apartment search platform. Monorepo with two apps:

| App | Stack | Port | Dir |
|-----|-------|------|-----|
| **Backend** | Fastify 5, Prisma 7, PostgreSQL, Playwright | 8080 | `backend/` |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Vercel AI SDK | 3000 | `frontend/` |

The frontend proxies API calls via Next.js rewrites: `/api/v1/:path*` → `http://localhost:8080/api/v1/:path*`.

## Architecture

```
backend/src/
  api/{feature}/        ← Routes + Controllers (HTTP layer)
  features/{feature}/   ← Services + Types (business logic)
  database/             ← Prisma schema, client, migrations
  shared/               ← Middleware, shared types, utils

frontend/
  app/                  ← Next.js App Router pages + API routes
  components/           ← Shared React components
  lib/                  ← Utilities, types, API client, scoring
```

**Backend pattern**: Routes → Controllers → Services. Routes register Fastify handlers. Controllers parse/validate input. Services contain business logic and DB access.

**Frontend pattern**: Pages use server components by default. Client components are opt-in with `'use client'`. API routes in `app/api/` proxy to backend or handle AI/document logic.

## Build & Run

```sh
# Backend
cd backend
npm install --legacy-peer-deps
npm run start:db          # Start PostgreSQL via Docker
npm run db:push           # Sync Prisma schema to DB
npm run dev               # Start dev server (port 8080)
npm run test              # Run Vitest smoke tests

# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev               # Start Next.js dev server (port 3000)
```

> **Important**: Always use `--legacy-peer-deps` when installing. TypeScript 6.x peer dep conflicts exist.

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| GET | `/api/v1/listings` | List all listings (paginated) |
| GET | `/api/v1/listings/:id` | Single listing by ID |
| GET | `/api/v1/scrapers/jobs` | List scraper job history |
| POST | `/api/v1/scrapers/:sourceId/run` | Trigger a scraper run |

## Conventions

- **Files**: kebab-case (`in-berlin-wohnen.scraper.ts`)
- **Types**: PascalCase (`StandardListing`, `ScraperInterface`)
- **Controllers**: `{verb}{Resource}Handler` pattern (`getListingsHandler`)
- **Validation**: Zod v4 with `safeParse` + `treeifyError` for error messages
- **DB queries**: Raw SQL via `Prisma.sql` template literals (not Prisma Client query API)
- **Feature folders**: Group routes, controllers, services, and types by domain feature

## Environment Variables

Backend (`.env` in `backend/`):
- `DATABASE_URL` — PostgreSQL connection string
- `PORT` — Server port (default 8080)

Frontend (`.env.local` in `frontend/`):
- `NEXT_PUBLIC_BACKEND_URL` — Backend base URL (default `http://localhost:8080`)
- `OLLAMA_BASE_URL` — Ollama server URL for AI features
- `HUGGINGFACE_API_KEY` — Fallback AI provider

## Mietpreisbremse / Mietspiegel Integration

The platform performs Mietpreisbremse (rent brake) checks using data from the official **Berliner Mietspiegel 2024** (https://mietspiegel.berlin.de/). The `.github/skills/mietpreisbremse-check/` skill provides the full procedure for:

- Looking up the ortsübliche Vergleichsmiete (standard local comparable rent) by address, building age, and apartment size
- Calculating the maximum legal rent (Mietspiegel Mittelwert + 10%)
- Comparing a listing's Nettokaltmiete against the legal cap
- Providing tenant advice when rent exceeds the cap

Key data points: Wohnlage (einfach/mittel/gut), Baualtersklasse, Wohnfläche → Nettokaltmiete in €/m²/month.

## Testing

Backend uses Vitest. Tests live alongside source files or in `__tests__/` directories. Run with `npm run test` from `backend/`.

No frontend tests are configured yet.
