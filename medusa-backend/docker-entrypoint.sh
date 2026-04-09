#!/bin/sh
set -e
echo "Running database migrations..."
npx medusa db:migrate
echo "Starting Medusa on port ${PORT:-9000}..."
exec npx medusa start --host 0.0.0.0
