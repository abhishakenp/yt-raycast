# Medusa infrastructure (Docker)

Compose file: `docker-compose.yml` — Postgres, Redis, `medusa` (API on **:9000**), and one-off `medusa-migrate`.

**Run from repo root:**

- Full stack: `bun run medusa:docker`
- DBs only: `bun run medusa:up`
- Teardown: `bun run medusa:docker:down`

Bootstrap migrations + seed from the host: `bun run medusa:bootstrap-db` (requires `medusa-backend/.env` from `.env.example`).

Full backend instructions: [`../../medusa-backend/README.md`](../../medusa-backend/README.md).  
Admin / Ecommercify checklist: `admin-checklist.txt`.
