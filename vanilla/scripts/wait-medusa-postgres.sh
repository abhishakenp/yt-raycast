#!/usr/bin/env sh
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
COMPOSE="docker compose -f $ROOT/infra/medusa/docker-compose.yml"
i=0
while [ "$i" -lt 90 ]; do
  if $COMPOSE exec -T postgres pg_isready -U medusa -d medusa >/dev/null 2>&1; then
    exit 0
  fi
  i=$((i + 1))
  sleep 1
done
echo "Postgres not ready after 90s. Start it with: bun run medusa:up" >&2
exit 1
