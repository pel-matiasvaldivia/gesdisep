# syntax=docker/dockerfile:1
# Imagen de la Web (Next.js standalone). Contexto de build: raíz del monorepo.
FROM node:20-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ── Dependencias ──
# Se copian todos los manifiestos del workspace para respetar el lockfile.
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ── Build ──
FROM base AS build
# URL de la API embebida en el bundle del cliente. Por defecto vacía = mismo
# origen: el navegador llama a /api/* y la web lo proxea a la API interna
# (ver rewrites en next.config.mjs). Para llamar a una API en otro host, pasar
# --build-arg NEXT_PUBLIC_API_URL=https://api.tu-dominio.
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Destino del proxy /api. Next evalúa los rewrites en BUILD, así que se hornea
# acá. Por defecto apunta al servicio "api" del docker-compose de producción.
ARG API_INTERNAL_URL=http://api:3001
ENV API_INTERNAL_URL=$API_INTERNAL_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web ./apps/web
RUN pnpm --filter @gesdisep/web build

# ── Runtime (standalone) ──
FROM base AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
