FROM oven/bun:1
WORKDIR /app

# Install deps (cache layer)
COPY package.json bun.lock* bun.lockb* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN bun install --frozen-lockfile || bun install

# Source
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

ENV NODE_ENV=production
WORKDIR /app/apps/api
EXPOSE 3100
CMD ["bun", "run", "src/index.ts"]
