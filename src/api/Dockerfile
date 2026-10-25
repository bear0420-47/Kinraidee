# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@12.4.2 --activate

WORKDIR /workspace

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY src/api/package.json src/api/package.json
COPY src/web/package.json src/web/package.json

RUN pnpm install --frozen-lockfile --filter api...

FROM dependencies AS build

COPY tsconfig.base.json ./
COPY src/api ./src/api

# Prisma generation validates URLs but does not connect to either database.
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build \
    DIRECT_DATABASE_URL=postgresql://build:build@localhost:5432/build \
    pnpm --filter api prisma generate
RUN pnpm --filter api build
RUN pnpm --filter api deploy --prod --legacy /output/api \
    && generated_client="$(find /workspace/node_modules/.pnpm -path '*/node_modules/.prisma/client' -type d -print -quit)" \
    && deployed_prisma="$(find /output/api/node_modules/.pnpm -path '*/node_modules/.prisma' -type d -print -quit)" \
    && test -n "$generated_client" \
    && test -n "$deployed_prisma" \
    && rm -rf "$deployed_prisma/client" \
    && cp -R "$generated_client" "$deployed_prisma/client" \
    && rm -rf \
      /output/api/src \
      /output/api/prisma \
      /output/api/.env.example \
      /output/api/.prettierignore \
      /output/api/Dockerfile \
      /output/api/README.md \
      /output/api/prisma.config.ts \
      /output/api/tsconfig.json \
      /output/api/vitest.config.ts

FROM node:22-bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=8080
ENV LOCAL_UPLOADS_ENABLED=false

WORKDIR /app

COPY --from=build --chown=node:node /output/api ./

USER node

EXPOSE 8080

CMD ["node", "dist/server.js"]
