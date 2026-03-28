# ── Stage 1: builder ────────────────────────────────────────
FROM mcr.microsoft.com/playwright:v1.58.2-noble AS builder
WORKDIR /app

COPY package.json package-lock.json ./
# --legacy-peer-deps: typescript@6 exceeds typescript-eslint@8.57.2's peer range (<6.0.0)
# ESLint is not used during the Docker build so this conflict is safe to bypass
RUN npm ci --legacy-peer-deps

# Copy prisma files before generate
COPY .env ./
COPY prisma.config.ts ./
COPY src/database/schema.prisma ./src/database/schema.prisma
COPY src/database/migrations/ ./src/database/migrations/

RUN npx prisma generate

# Compile TypeScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── Stage 2: production ──────────────────────────────────────
FROM mcr.microsoft.com/playwright:v1.58.2-noble AS production
WORKDIR /app

COPY --from=builder /app/dist ./dist
# Full node_modules required: prisma CLI is a devDep but needed at runtime for migrate deploy
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/database/schema.prisma ./src/database/schema.prisma
COPY --from=builder /app/src/database/migrations/ ./src/database/migrations/
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY package.json ./

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["./docker-entrypoint.sh"]
