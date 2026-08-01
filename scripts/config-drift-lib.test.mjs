import { describe, expect, it } from 'vitest'

import {
  REQUIRED_CONVEX_ENV,
  REQUIRED_LIVE_CREDENTIAL_PREFIXES,
  REQUIRED_WEB_ENV,
  validateProductionConfig,
} from './config-drift-lib.mjs'

const validEnv = Object.fromEntries(
  REQUIRED_WEB_ENV.map((name) => [
    name,
    name === 'SHIP_FAST_IP_HASH_SALT' ? 'a'.repeat(64) : 'x'.repeat(32),
  ]),
)
for (const [name, prefix] of Object.entries(
  REQUIRED_LIVE_CREDENTIAL_PREFIXES,
)) {
  validEnv[name] = `${prefix}test-value`
}

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

  it('rejects test-mode production payment and auth credentials', () => {
    const result = validateProductionConfig({
      env: {
        ...validEnv,
        CLERK_SECRET_KEY: 'sk_test_clerk',
        RAZORPAY_KEY_ID: 'rzp_test_razorpay',
        STRIPE_SECRET_KEY: 'sk_test_stripe',
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_clerk',
      },
      convexEnvNames: new Set(REQUIRED_CONVEX_ENV),
    })

    expect(result).toEqual({
      ok: false,
      errors: [
        'production credential is not live: CLERK_SECRET_KEY',
        'production credential is not live: RAZORPAY_KEY_ID',
        'production credential is not live: STRIPE_SECRET_KEY',
        'production credential is not live: VITE_CLERK_PUBLISHABLE_KEY',
      ],
    })
  })
})
