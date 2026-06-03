#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${MACP_PROJECT_ROOT:-/Users/livio/Documents/ship-fast}"
VENDOR_DIR="$PROJECT_ROOT/.macp/vendor"
MACP_DIR="$VENDOR_DIR/macp"
AGENT_DIR="$VENDOR_DIR/macp-agent-mcp"
SERVER_JS="$AGENT_DIR/build/src/server.js"

bootstrap_repo() {
  local repo_url="$1"
  local target_dir="$2"
  if [ -d "$target_dir/.git" ]; then
    git -C "$target_dir" fetch --depth 1 origin main >/dev/null 2>&1 || true
    git -C "$target_dir" checkout -q FETCH_HEAD >/dev/null 2>&1 || true
    return
  fi
  rm -rf "$target_dir"
  git clone --depth 1 "$repo_url" "$target_dir" >/dev/null
}

if [ ! -f "$SERVER_JS" ]; then
  mkdir -p "$VENDOR_DIR"
  bootstrap_repo "https://github.com/multiagentcognition/macp.git" "$MACP_DIR"
  bootstrap_repo "https://github.com/multiagentcognition/macp-agent-mcp.git" "$AGENT_DIR"

  npm install --prefix "$MACP_DIR" --silent
  npm run --prefix "$MACP_DIR" build --silent
  npm install --prefix "$AGENT_DIR" --silent
  npm run --prefix "$AGENT_DIR" build --silent
fi

export MACP_PROJECT_ROOT="$PROJECT_ROOT"
exec node "$SERVER_JS" "$@"
