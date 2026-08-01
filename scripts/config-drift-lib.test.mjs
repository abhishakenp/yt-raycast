import { describe, expect, it } from 'vitest'

import {
  REQUIRED_CONVEX_ENV,
  REQUIRED_WEB_ENV,
  validateProductionConfig,
} from './config-drift-lib.mjs'

const validEnv = Object.fromEntries(
  REQUIRED_WEB_ENV.map((name) => [
    name,
    name === 'SHIP_FAST_IP_HASH_SALT' ? 'a'.repeat(64) : 'x'.repeat(32),
  ]),
)

describe('validateProductionConfig', () => {
  it('accepts complete typed web and Convex config', () => {
    expect(
      validateProductionConfig({
        env: validEnv,
        convexEnvNames: new Set(REQUIRED_CONVEX_ENV),
      }),
    ).toEqual({ ok: true, errors: [] })
  })

  it('reports web, secret, type, and Convex drift', () => {
    const result = validateProductionConfig({
      env: {
        ...validEnv,
        STRIPE_WEBHOOK_SECRET: 'short',
        DISABLE_PAYWALL: 'yes',
      },
      convexEnvNames: new Set(),
    })
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('secret too short: STRIPE_WEBHOOK_SECRET')
    expect(result.errors).toContain('invalid boolean: DISABLE_PAYWALL')
    expect(result.errors).toContain(
      'missing Convex env: GITHUB_WEBHOOK_MUTATION_SECRET',
    )
  })
})
