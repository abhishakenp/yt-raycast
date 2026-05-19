#!/bin/sh
# Per-tenant Medusa boot:
#   1. Wait for the shared Postgres (DATABASE_URL).
#   2. Run pending migrations against this tenant's database.
#   3. Bootstrap the seed admin user (idempotent — tolerates re-run errors).
#   4. Start the server bound to 0.0.0.0:$PORT.
# The .medusa/server bundle (server + admin UI) is baked into the image at
# build time (Dockerfile `RUN npx --no medusa build`), so per-container boot
# stays under a few seconds — no webpack at runtime.
set -eu

PORT="${PORT:-9000}"
DEADLINE=$(( $(date +%s) + 90 ))

wait_for_pg() {
  echo "[entrypoint] waiting for postgres at ${DATABASE_URL:-unset}…"
  while [ "$(date +%s)" -lt "$DEADLINE" ]; do
    if node -e "const{Client}=require('pg');new Client({connectionString:process.env.DATABASE_URL}).connect().then(c=>c.end()).then(()=>process.exit(0)).catch(()=>process.exit(1))"; then
      echo "[entrypoint] postgres reachable"
      return 0
    fi
    sleep 2
  done
  echo "[entrypoint] postgres never came up — aborting"
  exit 1
}

wait_for_pg

# Switch to the built production bundle for the rest of the boot. Medusa v2's
# `medusa start` resolves admin assets relative to CWD via ./public/admin, so
# running from /app would 404 on /app even though the admin is built — the
# bundle lives at .medusa/server/public/admin instead.
cd /app/.medusa/server

echo "[entrypoint] running migrations…"
npx --no medusa db:migrate || {
  status=$?
  echo "[entrypoint] db:migrate exit=$status — continuing (idempotent on already-migrated tenant DBs)"
}

# Bootstrap the first admin User. Medusa v2's /auth/user/emailpass/register
# creates an auth identity but NOT a linked admin User — hitting /admin/* with
# the registration token returns 401. `medusa user` writes both records
# directly, in one transaction. Idempotent: if the email already exists, the
# command exits non-zero with a unique-constraint error which we tolerate so
# container restarts don't crash on the second boot.
SEED_EMAIL="${MEDUSA_SEED_ADMIN_EMAIL:-admin@ship-fast.local}"
SEED_PASSWORD="${MEDUSA_SEED_ADMIN_PASSWORD:-supersecret}"
echo "[entrypoint] bootstrapping admin user ${SEED_EMAIL}…"
npx --no medusa user --email "${SEED_EMAIL}" --password "${SEED_PASSWORD}" 2>&1 | sed 's/^/[medusa user] /' || {
  echo "[entrypoint] medusa user exited non-zero — likely already provisioned, continuing"
}

echo "[entrypoint] starting medusa on 0.0.0.0:${PORT}…"
exec npx --no medusa start --host 0.0.0.0 --port "${PORT}"
