import { describe, expect, it } from 'vitest'

import { hasConfiguredValue, parseAppEnv } from '@/shared/env/app-env'

describe('app env', () => {
  it('uses a local base URL by default', () => {
    expect(parseAppEnv({}).APP_BASE_URL).toBe('http://localhost:3000')
  })

  it('accepts valid configured integration URLs', () => {
    const env = parseAppEnv({
      APP_BASE_URL: 'https://ship-fast.io',
      CONVEX_URL: 'https://convex.ship-fast.io',
      CONVEX_SELF_HOSTED_URL: 'https://convex.ship-fast.io',
      CONVEX_SELF_HOSTED_ADMIN_KEY: 'admin-key',
      VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      VITE_CONVEX_SELF_HOSTED_URL: 'https://convex.ship-fast.io',
      MEDUSA_BACKEND_URL: 'https://commerce.ship-fast.io',
      MEDUSA_ADMIN_URL: 'https://commerce.ship-fast.io/app',
      MEDUSA_STOREFRONT_URL: 'https://store.ship-fast.io',
      MEDUSA_PUBLISHABLE_KEY: 'pk_medusa',
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: 'https://public-commerce.ship-fast.io',
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: 'pk_public_medusa',
      VITE_MEDUSA_BACKEND_URL: 'https://vite-commerce.ship-fast.io',
      VITE_MEDUSA_PUBLISHABLE_KEY: 'pk_vite_medusa',
    })

    expect(env.CONVEX_URL).toBe('https://convex.ship-fast.io')
    expect(env.CONVEX_SELF_HOSTED_URL).toBe('https://convex.ship-fast.io')
    expect(env.CONVEX_SELF_HOSTED_ADMIN_KEY).toBe('admin-key')
    expect(env.VITE_CONVEX_SELF_HOSTED_URL).toBe('https://convex.ship-fast.io')
    expect(env.MEDUSA_BACKEND_URL).toBe('https://commerce.ship-fast.io')
    expect(env.MEDUSA_ADMIN_URL).toBe('https://commerce.ship-fast.io/app')
    expect(env.MEDUSA_STOREFRONT_URL).toBe('https://store.ship-fast.io')
    expect(env.MEDUSA_PUBLISHABLE_KEY).toBe('pk_medusa')
    expect(env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).toBe(
      'https://public-commerce.ship-fast.io',
    )
    expect(env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY).toBe('pk_public_medusa')
    expect(env.VITE_MEDUSA_BACKEND_URL).toBe(
      'https://vite-commerce.ship-fast.io',
    )
    expect(env.VITE_MEDUSA_PUBLISHABLE_KEY).toBe('pk_vite_medusa')
  })

  it('rejects invalid URLs', () => {
    expect(() => parseAppEnv({ CONVEX_URL: 'invalid-url' })).toThrow()
    expect(() =>
      parseAppEnv({ CONVEX_SELF_HOSTED_URL: 'invalid-url' }),
    ).toThrow()
    expect(() =>
      parseAppEnv({ VITE_CONVEX_SELF_HOSTED_URL: 'invalid-url' }),
    ).toThrow()
  })

  it('detects empty configured values', () => {
    expect(hasConfiguredValue('   ')).toBe(false)
    expect(hasConfiguredValue('key')).toBe(true)
  })
})
