import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

function read(path: string): string {
  return readFileSync(path, 'utf8')
}

describe('Medusa Dokploy production assets', () => {
  it('defines a shared Medusa stack reachable through Dokploy Traefik', () => {
    const compose = read('infra/medusa/docker-compose.yml')

    expect(compose).toContain('medusa-postgres:')
    expect(compose).toContain('medusa-redis:')
    expect(compose).toContain('medusa-server:')
    expect(compose).toContain('medusa-worker:')
    expect(compose).toContain('context: ../../medusa-backend')
    expect(compose).toContain('MEDUSA_WORKER_MODE: server')
    expect(compose).toContain('MEDUSA_WORKER_MODE: worker')
    expect(compose).toContain("DISABLE_MEDUSA_ADMIN: 'false'")
    expect(compose).toContain("DISABLE_MEDUSA_ADMIN: 'true'")
    expect(compose).toContain(
      'STORE_CORS:-https://ship-fast.io,https://ship-fast.devliv.io',
    )
    expect(compose).toContain('ADMIN_CORS:-https://medusa.devliv.io')
    expect(compose).toContain(
      'AUTH_CORS:-https://ship-fast.io,https://ship-fast.devliv.io,https://medusa.devliv.io',
    )
    expect(compose).toContain(
      'traefik.http.routers.ship-fast-medusa.rule=Host(`medusa.devliv.io`)',
    )
    expect(compose).toContain('dokploy-network:')
    expect(compose).toContain('external: true')
  })

  it('runs migrations, bootstrap, and stable admin seeding before serving', () => {
    const dockerfile = read('medusa-backend/Dockerfile')
    const entrypoint = read('medusa-backend/docker-entrypoint.sh')

    expect(dockerfile).toContain('FROM oven/bun:1.3.12-alpine')
    expect(dockerfile).toContain('RUN apk add --no-cache nodejs')
    expect(dockerfile).toContain('RUN bun install --frozen-lockfile')
    expect(dockerfile).toContain('RUN bun run build')
    expect(dockerfile).toContain('ENTRYPOINT ["./docker-entrypoint.sh"]')
    expect(dockerfile).toContain(
      'CMD ["node", "./node_modules/@medusajs/cli/cli.js", "start"]',
    )
    expect(entrypoint).toContain('node "$MEDUSA_CLI" db:migrate')
    expect(entrypoint).toContain(
      'node "$MEDUSA_CLI" exec ./src/scripts/bootstrap.ts',
    )
    expect(entrypoint).toContain('node "$MEDUSA_CLI" user')
  })
})
