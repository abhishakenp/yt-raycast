# Medusa backend (Ship Fast)

Medusa v2 stack aligned with `@medusajs/*` **2.13.5** (see `package.json`). Store API and admin ship on port **9000**.

## Prerequisites

- **Docker** (Postgres 15 + Redis 7 via `infra/medusa/docker-compose.yml`), or
- **Node 20+** and **Bun** (same version as repo root, `packageManager` in `package.json`)

## Option A — Full stack in Docker

From the **repository root**:

1. `bun run medusa:docker`
2. First-time database (host talks to Postgres on `localhost:5432`):
   - `cp medusa-backend/.env.example medusa-backend/.env`
   - `bun install --cwd medusa-backend`
   - `bun run medusa:bootstrap-db` (`medusa:up` + wait + `medusa:migrate` + `medusa:seed`)
3. **Store API:** http://localhost:9000 — **Admin:** http://localhost:9000/app  
 First admin user (repo root): `bun run medusa:user -- --email you@example.com --password yourpassword`  
   Or from this directory: `bun run user:create -- --email you@example.com --password yourpassword`
4. Stop: `bun run medusa:docker:down`

If Postgres/Redis are already up: `bun run medusa:wait-db && bun run medusa:migrate && bun run medusa:seed`

## Option B — Databases in Docker, Medusa on the host (hot reload)

1. `cp medusa-backend/.env.example medusa-backend/.env`
2. `bun install --cwd medusa-backend`
3. `bun run medusa:bootstrap-db`
4. `bun run medusa:dev`

## CORS and storefront

Set `STORE_CORS` and `AUTH_CORS` in `.env` to match your Next (or Ship Fast) origin. In the storefront, set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` from a publishable key created in Admin.

## Ship Fast / Ecommercify

See `../infra/medusa/admin-checklist.txt` for admin setup and the Ecommercify flow (`SHIP_FAST_URL`, session-scoped catalog, optional `VITE_ECOMMERCIFY_AUTO_IMPORT` in `.env`).

## Compose layout

Docker services and env defaults: `../infra/medusa/docker-compose.yml`.
