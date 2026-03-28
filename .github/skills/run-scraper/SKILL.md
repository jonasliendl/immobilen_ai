---
name: run-scraper
description: 'Run a web scraper to fetch Berlin rental listings. Use when user asks to scrape, fetch new listings, run a scraper, or update listing data from a specific source.'
argument-hint: 'Source ID to scrape (e.g., in-berlin-wohnen)'
---

# Run Scraper

Execute a registered scraper to fetch and upsert rental listings into the database.

## When to Use

- User asks to "run the scraper", "scrape listings", "fetch new apartments"
- User wants to update listing data from a specific source
- User wants to test a scraper after making changes

## Prerequisites

- Backend server must be running on port 8080
- PostgreSQL database must be running (`npm run start:db` in backend/)
- Scraper must be registered in `backend/src/features/scraper/scraper.registry.ts`

## Procedure

1. **Verify backend is running** — Check `GET http://localhost:8080/health`
2. **If backend is down**, start it:
   ```sh
   cd backend && npm run dev
   ```
3. **List available scrapers** by checking the registry:
   - Read `backend/src/features/scraper/scraper.registry.ts` to find registered `sourceId` values
4. **Trigger the scraper**:
   ```sh
   curl -s -X POST http://localhost:8080/api/v1/scrapers/{sourceId}/run | jq .
   ```
   Replace `{sourceId}` with the scraper's `sourceId` (e.g., `in-berlin-wohnen`)
5. **Verify results** — The response includes:
   - `jobId` — Unique job identifier
   - `status` — `SUCCESS` or `FAILED`
   - `listingsProcessed` — Number of raw listings found
   - `listingsUpserted` — Number of listings saved/updated
   - `errorMessage` — Error details if failed
6. **Check job history** (optional):
   ```sh
   curl -s http://localhost:8080/api/v1/scrapers/jobs | jq .
   ```

## Available Scrapers

| Source ID | Type | Schedule | Site |
|-----------|------|----------|------|
| `in-berlin-wohnen` | Browser (Playwright) | `0 2 * * *` | inberlinwohnen.de |

## Troubleshooting

- **Connection refused**: Backend not running. Start with `cd backend && npm run dev`
- **Source not found**: Check `sourceId` matches registry. Available IDs are listed above
- **Browser launch failed**: Run `cd backend && npx playwright install chromium`
- **Database error**: Ensure PostgreSQL is running with `npm run start:db`
