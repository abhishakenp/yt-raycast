#!/bin/sh
set -e
echo "Running database migrations..."
node ./node_modules/@medusajs/cli/cli.js db:migrate
echo "Starting Medusa on port ${PORT:-9000}..."
cd /app/.medusa/server
exec node /app/node_modules/@medusajs/cli/cli.js start --host 0.0.0.0
