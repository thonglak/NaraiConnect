FROM oven/bun:1
WORKDIR /app

# Install deps (cache layer)
COPY package.json bun.lock* bun.lockb* ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN bun install --linker=hoisted --frozen-lockfile || bun install --linker=hoisted

# Source
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# Build SolidStart bundle. Bun's `.bin/vinxi` symlink shim breaks relative
# imports inside vinxi's CLI, so invoke the real cli.mjs directly.
WORKDIR /app/apps/web
RUN bun /app/node_modules/vinxi/bin/cli.mjs build

ENV NODE_ENV=production
EXPOSE 3001
CMD ["bun", "/app/node_modules/vinxi/bin/cli.mjs", "start", "--port", "3001"]
