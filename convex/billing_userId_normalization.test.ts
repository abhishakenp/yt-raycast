import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('userId normalization in billing', () => {
  beforeEach(() => {
    vi.stubEnv('BILLING_WEBHOOK_MUTATION_SECRET', 'billing-secret')
    vi.stubEnv('CLERK_JWT_ISSUER_DOMAIN', 'https://test-clerk.clerk.accounts.dev')
  })

  it('normalizes bare userId with issuer prefix when adding credits', async () => {
    const t = convexTest(schema, modules)
    const bareUserId = 'user_abc123'
    const expectedNormalized = 'https://test-clerk.clerk.accounts.dev|user_abc123'

    // Add credits with bare userId
    await t.mutation(internal.billing.addCreditsForUser, {
      userId: bareUserId,
      amount: 5,
    })

    // Query with bare userId — should be normalized to match
    const credits = await t.query(api.billing.getUserCredits, {
      userId: bareUserId,
      secret: 'billing-secret',
    })
    expect(credits).toBe(5)

    // Verify the stored record has the normalized userId
    const stored = await t.run(async (ctx) =>
      ctx.db
        .query('customerCredits')
        .withIndex('by_userId', (index) =>
          index.eq('userId', expectedNormalized),
        )
        .first(),
    )
    expect(stored).not.toBeNull()
    expect(stored?.remaining).toBe(5)
  })

  it('does not double-prefix an already-prefixed userId', async () => {
    const t = convexTest(schema, modules)
    const prefixedUserId =
      'https://test-clerk.clerk.accounts.dev|user_def456'

    await t.mutation(internal.billing.addCreditsForUser, {
      userId: prefixedUserId,
      amount: 3,
    })

    const credits = await t.query(api.billing.getUserCredits, {
      userId: prefixedUserId,
      secret: 'billing-secret',
    })
    expect(credits).toBe(3)
  })

  it('normalizes userId in applyBillingWebhook', async () => {
    const t = convexTest(schema, modules)
    const bareUserId = 'user_webhook_test'

    await t.mutation(api.billing.applyBillingWebhook, {
      secret: 'billing-secret',
      provider: 'razorpay',
      idempotencyKey: 'order.paid:normalization_test',
      userId: bareUserId,
      credits: 10,
    })

    // Consume with bare userId — should normalize and find the credits
    const consumed = await t.mutation(
      internal.billing.consumeCreditForExport,
      { userId: bareUserId },
    )
    expect(consumed.remaining).toBe(9)
  })
})
