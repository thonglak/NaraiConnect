# ── Stage 1: composer (vendor without dev) ─────────────────────────────
# BuildKit cache mount on /tmp/composer-cache so re-runs reuse downloaded
# zips and the build survives transient Packagist hiccups.
FROM composer:2 AS vendor
ENV COMPOSER_HOME=/tmp/composer-home \
    COMPOSER_CACHE_DIR=/tmp/composer-cache \
    COMPOSER_PROCESS_TIMEOUT=600 \
    COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /app
COPY apps/admin/composer.json apps/admin/composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache,sharing=locked \
    composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction
COPY apps/admin/ ./
RUN --mount=type=cache,target=/tmp/composer-cache,sharing=locked \
    composer dump-autoload --optimize --no-dev --classmap-authoritative

# ── Stage 2: node (build Vite assets) ──────────────────────────────────
FROM node:20-alpine AS assets
WORKDIR /app
COPY apps/admin/package.json apps/admin/package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    (npm ci --no-audit --no-fund || npm install --no-audit --no-fund)
COPY apps/admin/ ./
RUN npm run build

# ── Stage 3: runtime (PHP-FPM + nginx + supervisord) ──────────────────
FROM php:8.3-fpm-bookworm AS runtime

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
        nginx \
        supervisor \
        ca-certificates \
        libzip-dev \
        libonig-dev \
        libicu-dev \
        zlib1g-dev \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mysqli \
        zip \
        intl \
        bcmath \
        mbstring \
        opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/log/nginx/*

# Production-grade opcache settings.
RUN { \
        echo 'opcache.enable=1'; \
        echo 'opcache.enable_cli=0'; \
        echo 'opcache.memory_consumption=192'; \
        echo 'opcache.interned_strings_buffer=16'; \
        echo 'opcache.max_accelerated_files=20000'; \
        echo 'opcache.validate_timestamps=0'; \
        echo 'opcache.revalidate_freq=0'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

# Copy app + vendor + built assets.
COPY --from=vendor /app /var/www/html
COPY --from=assets /app/public/build /var/www/html/public/build

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

COPY docker/admin.nginx.conf /etc/nginx/sites-available/default
COPY docker/admin.supervisord.conf /etc/supervisor/conf.d/admin.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
