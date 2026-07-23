#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/app}"
SERVER_DIR="${MEDUSA_SERVER_DIR:-$APP_DIR/.medusa/server}"
MEDUSA_CLI="$APP_DIR/node_modules/@medusajs/cli/cli.js"

run_medusa() {
  (cd "$SERVER_DIR" && node "$MEDUSA_CLI" "$@")
}

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  run_medusa db:migrate
fi

if [ "${RUN_BOOTSTRAP:-true}" = "true" ] && [ "${MEDUSA_WORKER_MODE:-server}" = "server" ]; then
  run_medusa exec ./src/scripts/bootstrap.js
fi

if [ "${MEDUSA_WORKER_MODE:-server}" = "server" ] &&
  [ -n "${MEDUSA_SEED_ADMIN_EMAIL:-}" ] &&
  [ -n "${MEDUSA_SEED_ADMIN_PASSWORD:-}" ]; then
  run_medusa user \
    -e "$MEDUSA_SEED_ADMIN_EMAIL" \
    -p "$MEDUSA_SEED_ADMIN_PASSWORD" || true
fi

if [ "$#" -eq 0 ]; then
  set -- start
fi

if [ "$1" = "start" ]; then
  shift
  cd "$SERVER_DIR"
  exec node "$MEDUSA_CLI" start "$@"
fi

exec "$@"
