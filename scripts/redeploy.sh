#!/usr/bin/env bash
# Apply changes to apps/admin/.env.production on a running prod stack.
#
#   docker recreates the admin container so env_file is re-read, then
#   Laravel's optimize caches are flushed and rebuilt so cached config
#   doesn't keep returning stale values.
#
# Usage:
#   ./scripts/redeploy.sh                  # default: recreate + optimize
#   ./scripts/redeploy.sh --rebuild        # also rebuild the image first
#   ./scripts/redeploy.sh --no-optimize    # skip cache rebuild (debug)

set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml"
ENV_FILE="apps/admin/.env.production"

REBUILD=0
DO_OPTIMIZE=1
for arg in "$@"; do
    case "$arg" in
        --rebuild)     REBUILD=1 ;;
        --no-optimize) DO_OPTIMIZE=0 ;;
        -h|--help)
            sed -n '2,11p' "$0" | sed 's/^# \?//'
            exit 0
            ;;
        *)
            echo "unknown flag: $arg" >&2
            exit 2
            ;;
    esac
done

if [[ ! -f "$ENV_FILE" ]]; then
    echo "✗ $ENV_FILE not found — copy from apps/admin/.env.example first" >&2
    exit 1
fi

echo "▸ env: $ENV_FILE  ($(wc -l < "$ENV_FILE") lines)"

if [[ "$REBUILD" == "1" ]]; then
    echo "▸ rebuild image"
    $COMPOSE build admin
fi

echo "▸ recreate admin container"
$COMPOSE up -d --force-recreate admin

# Wait for php-fpm/nginx to be ready inside the container before exec'ing
# artisan, otherwise the bootstrap can race the supervisord startup.
echo "▸ wait for container to be healthy"
for i in {1..20}; do
    if $COMPOSE exec -T admin php -r 'echo "ok";' >/dev/null 2>&1; then
        break
    fi
    sleep 0.5
done

if [[ "$DO_OPTIMIZE" == "1" ]]; then
    echo "▸ optimize:clear"
    $COMPOSE exec -T admin php artisan optimize:clear
    echo "▸ optimize"
    $COMPOSE exec -T admin php artisan optimize
fi

echo "✓ done"
$COMPOSE ps admin
