# Ship Fast Medusa Backend

Shared Medusa v2 backend for generated Ship Fast commerce sessions.

Production topology:

- one Medusa server at `https://medusa.ship-fast.ai`
- one Medusa worker sharing the same Postgres and Redis
- session isolation by Medusa sales channel, publishable API key, and scoped product handles

Dokploy uses `infra/medusa/docker-compose.yml`.

Required production secrets live in Dokploy environment variables, not in this repo:

- `MEDUSA_POSTGRES_PASSWORD`
- `DATABASE_URL`
- `JWT_SECRET`
- `COOKIE_SECRET`
- `MEDUSA_SEED_ADMIN_EMAIL`
- `MEDUSA_SEED_ADMIN_PASSWORD`

After deployment, configure Ship Fast with:

- `MEDUSA_BACKEND_URL=https://medusa.ship-fast.ai`
- `MEDUSA_ADMIN_URL=https://medusa.ship-fast.ai/app`
- `MEDUSA_STOREFRONT_URL=https://ship-fast.io`
- Medusa admin credentials or `MEDUSA_ADMIN_API_TOKEN`
- `MEDUSA_PUBLISHABLE_API_KEY` fallback for API-root store routes
