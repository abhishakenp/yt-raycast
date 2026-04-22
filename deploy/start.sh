#!/bin/sh
set -e

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"

echo "[monolith] Starting Express backend on :7420..."
DASHBOARD_PORT=7420 bun "$ROOT/src/index.js" &
BACKEND_PID=$!

echo "[monolith] Waiting for backend to initialize..."
sleep 2

NEXT_PORT="${PORT:-3000}"
echo "[monolith] Starting Next.js server on :${NEXT_PORT}..."
cd "$ROOT"
PORT="$NEXT_PORT" SF_BACKEND_ORIGIN=http://127.0.0.1:7420 node "$ROOT/deploy/server.mjs"
