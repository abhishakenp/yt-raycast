#!/usr/bin/env bash
# One-shot setup for local subdomain deployments (*.ship-fast.test).
# Idempotent — safe to run multiple times.
#
# Installs: dnsmasq, mkcert, traefik (via Homebrew)
# Configures: DNS wildcard, SSL certs, Traefik reverse proxy, .env.local, Convex env
# Starts: dnsmasq + traefik
#
# Usage: bun run traefik:setup
set -euo pipefail

# ── Config ──────────────────────────────────────────────────────────────────
DOMAIN="ship-fast.test"
VITE_PORT="3000"
TRAEFIK_DASHBOARD_PORT="8082"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CERT_DIR="$PROJECT_ROOT/.local-proxy/certs"
ENV_LOCAL="$PROJECT_ROOT/.env.local"

# Colors
red()    { printf '\033[0;31m%s\033[0m\n' "$*"; }
green()  { printf '\033[0;32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$*"; }
dim()    { printf '\033[2m%s\033[0m\n' "$*"; }

# ── Preflight ───────────────────────────────────────────────────────────────
if [[ "$(uname)" != "Darwin" ]]; then
  red "This setup script is macOS-only (uses Homebrew + /etc/resolver)."
  exit 1
fi

if ! command -v brew &>/dev/null; then
  red "Homebrew is not installed. Install it first:"
  echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
  exit 1
fi

# ── 1. Install prerequisites ────────────────────────────────────────────────
echo ""
green "1. Checking prerequisites…"

install_brew_pkg() {
  local pkg="$1"
  if brew list "$pkg" &>/dev/null 2>&1; then
    dim "   ✓ $pkg already installed"
  else
    echo "   Installing $pkg…"
    brew install "$pkg" 2>&1 | tail -3
  fi
}

install_brew_pkg dnsmasq
install_brew_pkg mkcert
install_brew_pkg traefik

# ── 2. DNS — dnsmasq wildcard ───────────────────────────────────────────────
echo ""
green "2. Configuring DNS (*.${DOMAIN} → 127.0.0.1)…"

DNSMASQ_CONF="$(brew --prefix)/etc/dnsmasq.conf"

if grep -q "address=/${DOMAIN}/" "$DNSMASQ_CONF" 2>/dev/null; then
  dim "   ✓ dnsmasq config already has ${DOMAIN}"
else
  echo "address=/${DOMAIN}/127.0.0.1" | sudo tee -a "$DNSMASQ_CONF" > /dev/null
  dim "   ✓ Appended ${DOMAIN} to dnsmasq.conf"
fi

if [ -f "/etc/resolver/${DOMAIN}" ]; then
  dim "   ✓ /etc/resolver/${DOMAIN} already exists"
else
  sudo mkdir -p /etc/resolver
  echo "nameserver 127.0.0.1" | sudo tee "/etc/resolver/${DOMAIN}" > /dev/null
  dim "   ✓ Created /etc/resolver/${DOMAIN}"
fi

sudo brew services restart dnsmasq 2>/dev/null || true
dim "   ✓ dnsmasq service restarted"

# ── 3. SSL certs — mkcert ───────────────────────────────────────────────────
echo ""
green "3. Generating SSL certificates…"

mkdir -p "$CERT_DIR"

if [ -f "$CERT_DIR/${DOMAIN}+1.pem" ] && [ -f "$CERT_DIR/${DOMAIN}+1-key.pem" ]; then
  dim "   ✓ Wildcard cert already exists"
else
  mkcert -install 2>/dev/null || true
  (cd "$CERT_DIR" && mkcert "${DOMAIN}" "*.${DOMAIN}")
  dim "   ✓ Generated wildcard cert for *.${DOMAIN}"
fi

# ── 4. .env.local — NEXT_PUBLIC_BASE_DOMAIN ─────────────────────────────────
echo ""
green "4. Configuring .env.local…"

touch "$ENV_LOCAL"

if grep -q "^NEXT_PUBLIC_BASE_DOMAIN=" "$ENV_LOCAL" 2>/dev/null; then
  CURRENT=$(grep "^NEXT_PUBLIC_BASE_DOMAIN=" "$ENV_LOCAL" | cut -d= -f2)
  if [ "$CURRENT" = "$DOMAIN" ]; then
    dim "   ✓ NEXT_PUBLIC_BASE_DOMAIN=${DOMAIN} already set"
  else
    yellow "   ⚠ NEXT_PUBLIC_BASE_DOMAIN is '${CURRENT}', expected '${DOMAIN}'"
    echo "   Update .env.local manually if you want local subdomain routing."
  fi
else
  echo "NEXT_PUBLIC_BASE_DOMAIN=${DOMAIN}" >> "$ENV_LOCAL"
  dim "   ✓ Appended NEXT_PUBLIC_BASE_DOMAIN=${DOMAIN} to .env.local"
fi

# ── 5. Convex env — DEPLOYMENT_BASE_DOMAIN ──────────────────────────────────
echo ""
green "5. Setting Convex env (DEPLOYMENT_BASE_DOMAIN)…"

if command -v npx &>/dev/null; then
  CURRENT_CONVEX=$(npx convex env get DEPLOYMENT_BASE_DOMAIN 2>/dev/null || echo "")
  if [ "$CURRENT_CONVEX" = "$DOMAIN" ]; then
    dim "   ✓ Convex DEPLOYMENT_BASE_DOMAIN=${DOMAIN} already set"
  else
    npx convex env set DEPLOYMENT_BASE_DOMAIN "$DOMAIN" 2>/dev/null && \
      dim "   ✓ Set Convex DEPLOYMENT_BASE_DOMAIN=${DOMAIN}" || \
      yellow "   ⚠ Could not set Convex env. Run manually: npx convex env set DEPLOYMENT_BASE_DOMAIN ${DOMAIN}"
  fi
else
  yellow "   ⚠ npx not found. Set Convex env manually:"
  echo "   npx convex env set DEPLOYMENT_BASE_DOMAIN ${DOMAIN}"
fi

# ── 6. Stop conflicting services ────────────────────────────────────────────
echo ""
green "6. Checking for port conflicts…"

# Stop nginx if it's squatting on port 80
if sudo lsof -iTCP:80 -sTCP:LISTEN -P 2>/dev/null | grep -q nginx; then
  sudo nginx -s stop 2>/dev/null || true
  dim "   ✓ Stopped nginx (was on port 80)"
else
  dim "   ✓ Port 80 is free"
fi

# ── 7. Start Traefik ────────────────────────────────────────────────────────
echo ""
green "7. Starting Traefik reverse proxy…"

# Kill any existing traefik instance from our config
sudo pkill -f "traefik --configFile.*local-proxy" 2>/dev/null || true
sleep 1

TRAEFIK_BIN="$(brew --prefix)/opt/traefik/bin/traefik"
sudo "$TRAEFIK_BIN" \
  --configFile="$PROJECT_ROOT/.local-proxy/traefik.yml" \
  > /tmp/traefik.log 2>&1 &

sleep 2

if sudo lsof -iTCP:443 -sTCP:LISTEN -P 2>/dev/null | grep -q traefik; then
  dim "   ✓ Traefik listening on :80 and :443"
else
  red "   ✗ Traefik failed to start. Check /tmp/traefik.log"
  tail -5 /tmp/traefik.log 2>/dev/null
  exit 1
fi

# ── 8. Verify ───────────────────────────────────────────────────────────────
echo ""
green "8. Verifying…"

# DNS check
if dig +short "@127.0.0.1" "test.${DOMAIN}" 2>/dev/null | grep -q "127.0.0.1"; then
  dim "   ✓ DNS resolves *.${DOMAIN} → 127.0.0.1"
else
  yellow "   ⚠ DNS not resolving yet (may need a moment to propagate)"
fi

# SSL + proxy check (apex domain)
HTTP_CODE=$(curl -sk "https://${DOMAIN}/" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
  dim "   ✓ https://${DOMAIN} → proxy working (HTTP ${HTTP_CODE})"
elif [ "$HTTP_CODE" = "000" ]; then
  yellow "   ⚠ https://${DOMAIN} not reachable — is the Vite dev server running on port ${VITE_PORT}?"
  echo "   Start it with: bun run dev"
else
  yellow "   ⚠ https://${DOMAIN} returned HTTP ${HTTP_CODE}"
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
green "══════════════════════════════════════════════════════════"
green "  Local subdomain proxy is ready!"
green "══════════════════════════════════════════════════════════"
echo ""
echo "  DNS:       *.${DOMAIN} → 127.0.0.1"
echo "  SSL:       mkcert wildcard (trusted)"
echo "  Proxy:     https://*.${DOMAIN} → http://localhost:${VITE_PORT}"
echo "  Dashboard: http://localhost:${TRAEFIK_DASHBOARD_PORT}"
echo ""
echo "  Make sure the Vite dev server is running:"
echo "    bun run dev"
echo ""
echo "  Then click 'Publish ShipFast' — URLs will use *.${DOMAIN}"
echo ""
echo "  Stop the proxy:  bun run traefik:stop"
echo ""
