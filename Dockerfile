# ============================================================
# Blúmen Vision — Dockerfile para Google Cloud Run
# Multi-stage build: Node.js (frontend + backend)
# ============================================================

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código-fonte
COPY . .

# Build do frontend (Vite) e backend (esbuild)
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copiar package.json e instalar apenas dependências de produção
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile --prod

# Copiar build artifacts do stage anterior
COPY --from=builder /app/dist ./dist

# Copiar drizzle migrations (necessário para db:push em runtime)
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Copiar shared constants
COPY --from=builder /app/shared ./shared

# O Cloud Run injeta a variável PORT automaticamente
ENV NODE_ENV=production
ENV PORT=8080

# Expor a porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Iniciar a aplicação
CMD ["node", "dist/index.js"]
