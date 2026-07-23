# Medusa Dokploy Compose

Dokploy compose source for the shared Ship Fast Medusa backend.

Use this compose from repo source with compose path:

```text
infra/medusa/docker-compose.yml
```

The public service is `server`; it must stay attached to the external
`dokploy-network` so Traefik can route `https://medusa.ship-fast.ai`.

Environment variables are saved in Dokploy's compose environment editor. Dokploy
writes them to `.env`, and this compose injects them with both `env_file` and
explicit `environment` entries.
