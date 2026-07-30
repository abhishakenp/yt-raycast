import { describe, expect, it } from 'vitest'

import { hasConfiguredValue, parseAppEnv } from '@/shared/env/app-env'

describe('app env', () => {
  it('uses a local base URL by default', () => {
    expect(parseAppEnv({}).APP_BASE_URL).toBe('http://localhost:3000')
  })

  it('accepts valid configured integration URLs', () => {
    const env = parseAppEnv({
      APP_BASE_URL: 'https://ship-fast.ai',
      CONVEX_URL: 'https://convex.ship-fast.io',
      CONVEX_SELF_HOSTED_URL: 'https://convex.ship-fast.io',
      CONVEX_SELF_HOSTED_ADMIN_KEY: 'admin-key',
      VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      VITE_CONVEX_SELF_HOSTED_URL: 'https://convex.ship-fast.io',
      MEDUSA_BACKEND_URL: 'https://commerce.ship-fast.ai',
      MEDUSA_ADMIN_URL: 'https://commerce.ship-fast.ai/app',
      MEDUSA_STOREFRONT_URL: 'https://store.ship-fast.ai',
      MEDUSA_PUBLISHABLE_KEY: 'pk_medusa',
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: 'https://public-commerce.ship-fast.ai',
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: 'pk_public_medusa',
      VITE_MEDUSA_BACKEND_URL: 'https://vite-commerce.ship-fast.ai',
      VITE_MEDUSA_PUBLISHABLE_KEY: 'pk_vite_medusa',
      BILLING_WEBHOOK_MUTATION_SECRET: 'billing-secret',
      CONTENT_MODERATION_MUTATION_SECRET: 'moderation-secret',
      DUB_API_KEY: 'dub-secret',
      DUB_PARTNER_GROUP_ID: 'grp_ship_fast',
      DUB_PARTNERS_ENABLED: 'true',
      VITE_DUB_PARTNERS_ENABLED: 'true',
      VITE_DUB_PUBLISHABLE_KEY: 'dub-publishable',
      VITE_DUB_REFERRAL_DOMAIN: 'refer.ship-fast.ai',
      VITE_DUB_SITE_DOMAIN: 'ship-fast.ai',
      LINKFORTY_ENABLED: 'true',
      LINKFORTY_API_URL: 'https://links.ship-fast.ai',
      LINKFORTY_SERVICE_USER_ID: '00000000-0000-0000-0000-000000000001',
      LINKFORTY_WEBHOOK_SECRET: 'lf-webhook-secret',
      LINKFORTY_WEBHOOK_MUTATION_SECRET: 'lf-mutation-secret',
      VITE_LINKFORTY_ENABLED: 'true',
      VITE_LINKFORTY_BASE_URL: 'https://links.ship-fast.ai',
    })

    expect(env.CONVEX_URL).toBe('https://convex.ship-fast.io')
    expect(env.CONVEX_SELF_HOSTED_URL).toBe('https://convex.ship-fast.io')
    expect(env.CONVEX_SELF_HOSTED_ADMIN_KEY).toBe('admin-key')
    expect(env.VITE_CONVEX_SELF_HOSTED_URL).toBe('https://convex.ship-fast.io')
    expect(env.MEDUSA_BACKEND_URL).toBe('https://commerce.ship-fast.ai')
    expect(env.MEDUSA_ADMIN_URL).toBe('https://commerce.ship-fast.ai/app')
    expect(env.MEDUSA_STOREFRONT_URL).toBe('https://store.ship-fast.ai')
    expect(env.MEDUSA_PUBLISHABLE_KEY).toBe('pk_medusa')
    expect(env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).toBe(
      'https://public-commerce.ship-fast.ai',
    )
    expect(env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY).toBe('pk_public_medusa')
    expect(env.VITE_MEDUSA_BACKEND_URL).toBe(
      'https://vite-commerce.ship-fast.ai',
    )
    expect(env.VITE_MEDUSA_PUBLISHABLE_KEY).toBe('pk_vite_medusa')
    expect(env.BILLING_WEBHOOK_MUTATION_SECRET).toBe('billing-secret')
    expect(env.CONTENT_MODERATION_MUTATION_SECRET).toBe('moderation-secret')
    expect(env.DUB_API_KEY).toBe('dub-secret')
    expect(env.DUB_PARTNER_GROUP_ID).toBe('grp_ship_fast')
    expect(env.DUB_PARTNERS_ENABLED).toBe('true')
    expect(env.VITE_DUB_PARTNERS_ENABLED).toBe('true')
    expect(env.VITE_DUB_PUBLISHABLE_KEY).toBe('dub-publishable')
    expect(env.VITE_DUB_REFERRAL_DOMAIN).toBe('refer.ship-fast.ai')
    expect(env.VITE_DUB_SITE_DOMAIN).toBe('ship-fast.ai')
    expect(env.LINKFORTY_ENABLED).toBe('true')
    expect(env.LINKFORTY_API_URL).toBe('https://links.ship-fast.ai')
    expect(env.LINKFORTY_SERVICE_USER_ID).toBe(
      '00000000-0000-0000-0000-000000000001',
    )
    expect(env.LINKFORTY_WEBHOOK_SECRET).toBe('lf-webhook-secret')
    expect(env.LINKFORTY_WEBHOOK_MUTATION_SECRET).toBe('lf-mutation-secret')
    expect(env.VITE_LINKFORTY_ENABLED).toBe('true')
    expect(env.VITE_LINKFORTY_BASE_URL).toBe('https://links.ship-fast.ai')
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
