FROM oven/bun:1
WORKDIR /app

# Install deps (cache layer)
COPY package.json bun.lock* bun.lockb* ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN bun install --frozen-lockfile || bun install

# Source
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# Build SolidStart bundle
WORKDIR /app/apps/web
RUN bun run build

ENV NODE_ENV=production
EXPOSE 3001
CMD ["bun", "run", "start"]
