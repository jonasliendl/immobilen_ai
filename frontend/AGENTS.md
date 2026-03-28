# Frontend Guidelines

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

Next.js 16.2.1, React 19, Tailwind CSS 4 (PostCSS plugin), Vercel AI SDK (`ai` + `@ai-sdk/openai-compatible`), Leaflet for maps, shadcn/ui components.

## Architecture

```
app/
  page.tsx              ← Landing page (Budenfinder dashboard)
  layout.tsx            ← Root layout with navigation
  globals.css           ← Tailwind imports + custom CSS
  search/page.tsx       ← Listing search with filters
  chat/page.tsx         ← AI chat assistant
  intelligence/page.tsx ← Market intelligence dashboard
  tracker/page.tsx      ← Application tracking kanban
  listings/[id]/        ← Listing detail page
  apply/[id]/           ← Application form
  api/                  ← Next.js API routes (proxy + AI endpoints)
components/             ← Shared React components
lib/                    ← Utilities, types, API client
```

## Key Patterns

- **Server components by default** — Only add `'use client'` when needed (event handlers, hooks, browser APIs)
- **API proxy** — `next.config.ts` rewrites `/api/v1/*` to `NEXT_PUBLIC_BACKEND_URL` so frontend calls hit Fastify seamlessly
- **Streaming AI** — `/api/chat` uses Vercel AI SDK with Ollama (qwen2.5:7b-instruct) and HuggingFace fallback
- **Feature page intro** — `components/feature-page-intro.tsx` renders page headers with video previews; uses `VIDEO_MAP` keyed by eyebrow string
- **Navigation** — `components/navigation.tsx` provides site-wide nav with active-page highlighting

## API Routes

Frontend API routes in `app/api/` serve two purposes:
1. **AI endpoints** — `/api/chat`, `/api/tenant/score`, `/api/tenant/cover-letter`, `/api/intelligence/predictions`
2. **Data proxies** — `/api/listings`, `/api/applications`, `/api/neighborhoods`, `/api/documents`

## AI Integration

- Primary: Ollama at `OLLAMA_BASE_URL` with model `qwen2.5:7b-instruct`
- Fallback: HuggingFace Inference API with `HUGGINGFACE_API_KEY`
- Uses `@ai-sdk/openai-compatible` provider adapter
- Streaming responses via Vercel AI SDK `streamText`

## Styling

- Tailwind CSS 4 via PostCSS (`postcss.config.mjs`)
- Custom animations defined in `globals.css`
- shadcn/ui component library for UI primitives
- Prefer Tailwind utility classes over custom CSS

## Types

Shared types are in `lib/types.ts` (~360 lines, 30+ types). Key types: `Listing`, `Application`, `ChatMessage`, `TenantProfile`, `NeighborhoodData`.

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL` — Backend Fastify server URL (default `http://localhost:8080`)
- `OLLAMA_BASE_URL` — Ollama API base URL
- `HUGGINGFACE_API_KEY` — HuggingFace Inference API key
