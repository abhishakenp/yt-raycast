#!/usr/bin/env bash
# Stop the local subdomain proxy.
# Usage: bun run traefik:stop
set -euo pipefail

sudo pkill -f "traefik --configFile.*local-proxy" 2>/dev/null || true
sudo brew services stop dnsmasq 2>/dev/null || true

echo "✅ Proxy stopped"
