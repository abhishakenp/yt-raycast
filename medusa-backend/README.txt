Bundled Medusa v2 backend for Ship Fast ecommerce exports.

Prerequisites: Docker (for Postgres + Redis), or Node 20+ and Bun for local dev.

Option A — full stack in Docker (Postgres + Redis + Medusa API on port 9000):

1) From repository root:
   bun run medusa:docker

2) First-time data (from host, same DB volume):
   cp medusa-backend/.env.example medusa-backend/.env
   bun install --cwd medusa-backend && bun run medusa:migrate && bun run medusa:seed

   Or run seed against DATABASE_URL=postgres://medusa:medusa@127.0.0.1:5432/medusa when Postgres is exposed on 5432.

3) Store API: http://localhost:9000 — Admin: http://localhost:9000/app
   First admin user (from repo root): bun run medusa:user -- --email you@example.com --password yourpassword
   Or from medusa-backend: bun run user:create -- --email you@example.com --password yourpassword

4) Stop stack: bun run medusa:docker:down

Option B — databases in Docker, Medusa on the host (hot reload):

1) bun run medusa:up
2) cp medusa-backend/.env.example medusa-backend/.env
3) bun install --cwd medusa-backend && bun run medusa:migrate && bun run medusa:seed
4) bun run medusa:dev

The Docker image for Medusa is built from medusa-backend/Dockerfile (Node npm build; entrypoint runs migrations then medusa start).

Match STORE_CORS / AUTH_CORS to your Next dev URL. Copy a publishable API key from Admin into NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY on the storefront.
