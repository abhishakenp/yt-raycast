#!/usr/bin/env sh
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
CLI="$ROOT/node_modules/@medusajs/cli/cli.js"

if [ -n "$MEDUSA_NODE" ] && [ -x "$MEDUSA_NODE" ]; then
  exec "$MEDUSA_NODE" "$CLI" "$@"
fi

node_major_ok() {
  [ -x "$1" ] || return 1
  "$1" -e 'const m=+process.version.slice(1).split(".")[0];process.exit(m>=20?0:1)' 2>/dev/null
}

is_conda_node() {
  case "$1" in
    *miniconda*|*anaconda*|*/conda/*|*/conda_envs/*|*/.conda/*) return 0 ;;
    *) return 1 ;;
  esac
}

NODE=""
for candidate in /usr/local/bin/node /usr/bin/node; do
  if node_major_ok "$candidate" && ! is_conda_node "$candidate"; then
    NODE=$candidate
    break
  fi
done

if [ -z "$NODE" ]; then
  OLD_IFS=$IFS
  IFS=:
  for dir in $PATH; do
    [ -z "$dir" ] && continue
    candidate="${dir%/}/node"
    if node_major_ok "$candidate" && ! is_conda_node "$candidate"; then
      NODE=$candidate
      break
    fi
  done
  IFS=$OLD_IFS
  unset OLD_IFS
fi

if [ -z "$NODE" ]; then
  OLD_IFS=$IFS
  IFS=:
  for dir in $PATH; do
    [ -z "$dir" ] && continue
    candidate="${dir%/}/node"
    if node_major_ok "$candidate"; then
      NODE=$candidate
      break
    fi
  done
  IFS=$OLD_IFS
  unset OLD_IFS
fi

if [ -z "$NODE" ]; then
  echo "run-medusa-cli: need Node.js 20+. Set MEDUSA_NODE to your node binary if needed." >&2
  exit 1
fi

exec "$NODE" "$CLI" "$@"
