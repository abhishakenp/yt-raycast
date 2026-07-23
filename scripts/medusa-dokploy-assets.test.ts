import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

function read(path: string): string {
  return readFileSync(path, 'utf8')
}

describe('Medusa Dokploy production assets', () => {
  it('defines a shared Medusa stack reachable through Dokploy Traefik', () => {
    const compose = read('infra/medusa/docker-compose.yml')
    const traefik = read('infra/medusa/traefik.dynamic.yml')

    expect(compose).toContain('medusa-postgres:')
    expect(compose).toContain('medusa-redis:')
    expect(compose).toContain('server:')
    expect(compose).toContain('medusa-worker:')
    expect(compose).toContain('context: ../../medusa-backend')
    expect(compose).toContain('MEDUSA_WORKER_MODE: server')
    expect(compose).toContain('MEDUSA_WORKER_MODE: worker')
    expect(compose).toContain("DISABLE_MEDUSA_ADMIN: 'false'")
    expect(compose).toContain("DISABLE_MEDUSA_ADMIN: 'true'")
    expect(compose).toContain('http://127.0.0.1:9000/health')
    expect(compose).toContain('server:')
    expect(compose).toContain('condition: service_healthy')
    expect(compose).toContain('traefik.docker.network=dokploy-network')
    expect(compose).toContain(
      'traefik.http.routers.ship-fast-medusa-direct-websecure.priority=10000',
    )
    expect(compose).toContain(
      'traefik.http.routers.ship-fast-medusa-direct-websecure.service=ship-fast-medusa-direct',
    )
    expect(compose).toContain(
      'traefik.http.services.ship-fast-medusa-direct.loadbalancer.server.port=9000',
    )
    expect(compose).toContain(
      'Host(`medusa.ship-fast.ai`) || Host(`medusa.devliv.io`)',
    )
    expect(compose).toContain("RUN_MIGRATIONS: 'false'")
    expect(compose).toContain('MEDUSA_DB_CONNECTION_TIMEOUT_MS')
    expect(compose).toContain('__MEDUSA_DB_CONNECTION_MAX_RETRIES')
    expect(compose).toContain(
      'STORE_CORS:-https://ship-fast.io,https://ship-fast.devliv.io',
    )
    expect(compose).toContain('MEDUSA_BACKEND_URL:-https://medusa.ship-fast.ai')
    expect(compose).toContain(
      'ADMIN_CORS:-https://medusa.ship-fast.ai,https://medusa.devliv.io',
    )
    expect(compose).toContain(
      'AUTH_CORS:-https://ship-fast.io,https://ship-fast.devliv.io,https://medusa.ship-fast.ai,https://medusa.devliv.io',
    )
    expect(compose).toContain('dokploy-network:')
    expect(compose).toContain('external: true')
    expect(traefik).toContain('Host(`medusa.ship-fast.ai`)')
    expect(traefik).toContain('Host(`medusa.devliv.io`)')
    expect(traefik).toContain('priority: 70000')
    expect(traefik).toContain(
      "url: 'http://ship-fast-medusa-8szufp-server-1:9000'",
    )
  })

  it('runs migrations, bootstrap, and stable admin seeding before serving', () => {
    const dockerfile = read('medusa-backend/Dockerfile')
    const entrypoint = read('medusa-backend/docker-entrypoint.sh')

    expect(dockerfile).toContain('FROM oven/bun:1.3.12-alpine')
    expect(dockerfile).toContain('RUN apk add --no-cache nodejs')
    expect(dockerfile).toContain('RUN bun install --frozen-lockfile')
    expect(dockerfile).toContain('RUN bun run build')
    expect(dockerfile).toContain('ENTRYPOINT ["./docker-entrypoint.sh"]')
    expect(dockerfile).toContain('CMD ["start"]')
    expect(entrypoint).toContain('SERVER_DIR=')
    expect(entrypoint).toContain('run_medusa db:migrate')
    expect(entrypoint).toContain('run_medusa exec ./src/scripts/bootstrap.js')
    expect(entrypoint).toContain('run_medusa user')
    expect(entrypoint).toContain('exec node "$MEDUSA_CLI" start "$@"')
  })
})
