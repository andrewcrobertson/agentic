# Stage 1: Build
FROM node:22-slim AS build
ENV HUSKY=0
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages.config/ ./packages.config/
COPY packages.lib/system.logging/package.json ./packages.lib/system.logging/package.json
COPY packages.apps/api/package.json ./packages.apps/api/package.json

RUN pnpm install --frozen-lockfile

# Copy source
COPY packages.lib/system.logging/ ./packages.lib/system.logging/
COPY packages.apps/api/ ./packages.apps/api/

# Build dependencies then app
RUN pnpm --filter @agentic/system.logging build
RUN pnpm --filter @agentic/api build

# Stage 2: Deploy (prune to production deps using pnpm deploy)
FROM node:22-slim AS deploy
ENV HUSKY=0
RUN npm install -g pnpm

WORKDIR /app
COPY --from=build /app ./

RUN pnpm --filter @agentic/api deploy --prod /deploy/api

# Stage 3: Runtime
FROM node:22-slim AS runtime

WORKDIR /app
COPY --from=deploy /deploy/api ./
COPY --from=build /app/packages.apps/api/.env ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
