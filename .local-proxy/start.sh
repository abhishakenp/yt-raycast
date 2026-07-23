#!/usr/bin/env bash
# Start the local subdomain proxy (assumes setup has been run).
# Usage: bun run traefik:start
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)

# Restart dnsmasq
sudo brew services restart dnsmasq 2>/dev/null || true

# Stop nginx if squatting on port 80
sudo nginx -s stop 2>/dev/null || true

# Kill any existing traefik from our config
sudo pkill -f "traefik --configFile.*local-proxy" 2>/dev/null || true
sleep 1

# Start Traefik
sudo "$(brew --prefix)/opt/traefik/bin/traefik" \
  --configFile="$PROJECT_ROOT/.local-proxy/traefik.yml" \
  > /tmp/traefik.log 2>&1 &

sleep 2

if sudo lsof -iTCP:443 -sTCP:LISTEN -P 2>/dev/null | grep -q traefik; then
  echo "✅ Proxy started — https://*.ship-fast.test → localhost:3000"
  echo "   Dashboard: http://localhost:8082"
else
  echo "❌ Traefik failed to start. Check /tmp/traefik.log"
  tail -5 /tmp/traefik.log 2>/dev/null
  exit 1
fi
