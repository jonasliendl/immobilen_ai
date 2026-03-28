---
name: dev-environment
description: 'Start, stop, or troubleshoot the Budenfinder development environment. Use when user asks to start dev servers, fix port conflicts, reset the database, or check service health.'
argument-hint: 'What to do: start, stop, status, reset-db'
---

# Development Environment Management

Manage the Budenfinder local development stack: PostgreSQL, Fastify backend, and Next.js frontend.

## When to Use

- User asks to "start the dev environment" or "spin up the servers"
- User reports connection errors, port conflicts, or service issues
- User wants to reset or rebuild the database
- User asks about service health or status

## Services

| Service | Port | Start Command | Directory |
|---------|------|---------------|-----------|
| PostgreSQL | 5432 | `npm run start:db` | `backend/` |
| Fastify Backend | 8080 | `npm run dev` | `backend/` |
| Next.js Frontend | 3000 | `npm run dev` | `frontend/` |

## Procedures

### Start Everything

```sh
# 1. Start database
cd backend && npm run start:db

# 2. Sync schema
npm run db:push

# 3. Start backend (in background)
npm run dev &

# 4. Start frontend
cd ../frontend && npm run dev
```

### Check Health

```sh
# Backend
curl -s http://localhost:8080/health | jq .

# Frontend
curl -s http://localhost:3000 -o /dev/null -w "%{http_code}"

# Database
cd backend && docker compose -f docker-compose.db.yml ps
```

### Fix Port Conflicts

```sh
# Find and kill process on port
lsof -ti :8080 | xargs kill -9   # Backend
lsof -ti :3000 | xargs kill -9   # Frontend
```

### Reset Database

```sh
cd backend
npm run db:reset    # WARNING: Destroys all data
npm run db:push     # Re-sync schema
```

### Reinstall Dependencies

```sh
# Backend
cd backend && rm -rf node_modules && npm install --legacy-peer-deps

# Frontend
cd frontend && rm -rf node_modules && npm install --legacy-peer-deps
```

> Always use `--legacy-peer-deps` — TypeScript 6.x causes peer dependency conflicts.

### Install Playwright Browsers

```sh
cd backend && npx playwright install chromium
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `ECONNREFUSED :8080` | Backend not running | `cd backend && npm run dev` |
| `ECONNREFUSED :5432` | PostgreSQL not running | `cd backend && npm run start:db` |
| `EADDRINUSE :3000` | Stale Next.js process | `lsof -ti :3000 \| xargs kill -9` |
| `Browser not found` | Playwright not installed | `cd backend && npx playwright install chromium` |
| `peer dep conflict` | npm install without flag | Re-run with `--legacy-peer-deps` |
| `Prisma schema drift` | Schema changed | `cd backend && npm run db:push` |
