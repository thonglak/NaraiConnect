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

# Build SolidStart bundle. APP_BASE_PATH and VITE_API_URL must be available
# at build time (vinxi/Vite bake them into the bundle). Bun's `.bin/vinxi`
# symlink shim breaks relative imports, so invoke the real cli.mjs directly.
ARG APP_BASE_PATH=
ARG VITE_API_URL=
ENV APP_BASE_PATH=$APP_BASE_PATH
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /app/apps/web
RUN bun /app/node_modules/vinxi/bin/cli.mjs build

ENV NODE_ENV=production
EXPOSE 3001
CMD ["bun", "/app/node_modules/vinxi/bin/cli.mjs", "start", "--port", "3001"]
