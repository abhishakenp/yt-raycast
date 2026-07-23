#!/usr/bin/env sh
set -eu

MEDUSA_CLI="./node_modules/@medusajs/cli/cli.js"

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  node "$MEDUSA_CLI" db:migrate
fi

if [ "${RUN_BOOTSTRAP:-true}" = "true" ] && [ "${MEDUSA_WORKER_MODE:-server}" = "server" ]; then
  node "$MEDUSA_CLI" exec ./src/scripts/bootstrap.ts
fi

if [ "${MEDUSA_WORKER_MODE:-server}" = "server" ] &&
  [ -n "${MEDUSA_SEED_ADMIN_EMAIL:-}" ] &&
  [ -n "${MEDUSA_SEED_ADMIN_PASSWORD:-}" ]; then
  node "$MEDUSA_CLI" user \
    -e "$MEDUSA_SEED_ADMIN_EMAIL" \
    -p "$MEDUSA_SEED_ADMIN_PASSWORD" || true
fi

exec "$@"
