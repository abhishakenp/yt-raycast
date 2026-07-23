#!/usr/bin/env sh
set -eu

MEDUSA_BIN="./node_modules/.bin/medusa"

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  "$MEDUSA_BIN" db:migrate
fi

if [ "${RUN_BOOTSTRAP:-true}" = "true" ] && [ "${MEDUSA_WORKER_MODE:-server}" = "server" ]; then
  "$MEDUSA_BIN" exec ./src/scripts/bootstrap.ts
fi

if [ "${MEDUSA_WORKER_MODE:-server}" = "server" ] &&
  [ -n "${MEDUSA_SEED_ADMIN_EMAIL:-}" ] &&
  [ -n "${MEDUSA_SEED_ADMIN_PASSWORD:-}" ]; then
  "$MEDUSA_BIN" user \
    -e "$MEDUSA_SEED_ADMIN_EMAIL" \
    -p "$MEDUSA_SEED_ADMIN_PASSWORD" || true
fi

exec "$@"
