import { describe, expect, it } from 'vitest'
import { buildCustomerStackSpec, toStackSlug } from './stack-template'

const secrets = {
  jwtSecret: 'jwt-secret',
  cookieSecret: 'cookie-secret',
  databasePassword: 'db-password',
}

describe('toStackSlug', () => {
  it('produces a safe, deterministic slug for the same instanceId', () => {
    const a = toStackSlug('jd7abc123XYZ')
    const b = toStackSlug('jd7abc123XYZ')
    expect(a).toBe(b)
    expect(a).toMatch(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)
  })

  it('produces distinct slugs for distinct instance ids', () => {
    expect(toStackSlug('instance-one')).not.toBe(toStackSlug('instance-two'))
  })

  it('rejects instance ids that are too short to slug safely', () => {
    expect(() => toStackSlug('ab')).toThrow()
  })
})

describe('buildCustomerStackSpec', () => {
  it('rejects a mutable image tag instead of a digest pin', () => {
    expect(() =>
      buildCustomerStackSpec({
        instanceId: 'instance-mutable-tag',
        imageDigest: 'ghcr.io/org/medusa:latest',
        domainSuffix: 'commerce.ship-fast.ai',
        secrets,
      }),
    ).toThrow(/digest-pinned/)
  })

  it('builds unique service/network/volume names and wildcard routing per instance', () => {
    const specA = buildCustomerStackSpec({
      instanceId: 'instance-aaaa',
      imageDigest: 'ghcr.io/org/medusa@sha256:' + 'a'.repeat(64),
      domainSuffix: 'commerce.ship-fast.ai',
      secrets,
    })
    const specB = buildCustomerStackSpec({
      instanceId: 'instance-bbbb',
      imageDigest: 'ghcr.io/org/medusa@sha256:' + 'a'.repeat(64),
      domainSuffix: 'commerce.ship-fast.ai',
      secrets,
    })

    expect(specA.stackName).not.toBe(specB.stackName)
    expect(specA.network).not.toBe(specB.network)
    expect(specA.volumes.postgres).not.toBe(specB.volumes.postgres)
    expect(specA.volumes.redis).not.toBe(specB.volumes.redis)
    expect(specA.domain).toContain('commerce.ship-fast.ai')
    expect(specA.domain).not.toBe(specB.domain)
    expect(specA.services.server.labels?.some((label) => label.includes(specA.domain))).toBe(true)
  })

  it('never exposes a host port and only routes through Traefik labels', () => {
    const spec = buildCustomerStackSpec({
      instanceId: 'instance-no-ports',
      imageDigest: 'ghcr.io/org/medusa@sha256:' + 'b'.repeat(64),
      domainSuffix: 'commerce.ship-fast.ai',
      secrets,
    })

    expect(JSON.stringify(spec)).not.toContain('"ports"')
  })

  it('gives the server and worker distinct Medusa worker modes so only one runs the admin UI', () => {
    const spec = buildCustomerStackSpec({
      instanceId: 'instance-worker-mode',
      imageDigest: 'ghcr.io/org/medusa@sha256:' + 'c'.repeat(64),
      domainSuffix: 'commerce.ship-fast.ai',
      secrets,
    })

    expect(spec.services.server.environment.MEDUSA_WORKER_MODE).toBe('server')
    expect(spec.services.worker.environment.MEDUSA_WORKER_MODE).toBe('worker')
    expect(spec.services.server.environment.DISABLE_MEDUSA_ADMIN).toBe(
      'false',
    )
    expect(spec.services.worker.environment.DISABLE_MEDUSA_ADMIN).toBe(
      'true',
    )
  })

  it('threads the generated secrets into the database URL and JWT/cookie env vars without leaking them elsewhere', () => {
    const spec = buildCustomerStackSpec({
      instanceId: 'instance-secrets',
      imageDigest: 'ghcr.io/org/medusa@sha256:' + 'd'.repeat(64),
      domainSuffix: 'commerce.ship-fast.ai',
      secrets: {
        jwtSecret: 'unique-jwt',
        cookieSecret: 'unique-cookie',
        databasePassword: 'unique-db-password',
      },
    })

    expect(spec.services.server.environment.JWT_SECRET).toBe('unique-jwt')
    expect(spec.services.server.environment.COOKIE_SECRET).toBe(
      'unique-cookie',
    )
    expect(spec.services.server.environment.DATABASE_URL).toContain(
      'unique-db-password',
    )
    expect(spec.services.postgres.environment.POSTGRES_PASSWORD).toBe(
      'unique-db-password',
    )
  })
})
