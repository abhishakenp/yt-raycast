import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convexTest } from 'convex-test'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const here = dirname(fileURLToPath(import.meta.url))
const modules = import.meta.glob('./**/*.ts')

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('convex billing source shape', () => {
  it('derives public billing identity from Convex auth instead of client userId args', () => {
    const source = readFileSync(join(here, 'billing.ts'), 'utf8')

    expect(source).toContain('ctx.auth.getUserIdentity()')
    expect(source).toContain('export const getSubscriptionStatus = query')
    expect(source).toContain('export const getCreditBalance = query')
    expect(source).toContain('export const getBillingOverview = query')
    expect(source).toContain('args: {}')
    expect(source).not.toContain('args: { userId: v.string() }')
  })
})

describe('billing webhook state mutation', () => {
  it('idempotently applies subscription webhooks', async () => {
    vi.stubEnv('BILLING_WEBHOOK_MUTATION_SECRET', 'billing-secret')
    const t = convexTest(schema, modules)
    const userId = 'billing-subscription-user'

    const first = await t.mutation(api.billing.applyBillingWebhook, {
      secret: 'billing-secret',
      provider: 'stripe',
      idempotencyKey: 'evt_subscription_created',
      userId,
      subscription: {
        status: 'active',
        planId: 'pro',
        providerSubscriptionId: 'sub_123',
        providerCheckoutId: 'cs_123',
      },
    })
    const duplicate = await t.mutation(api.billing.applyBillingWebhook, {
      secret: 'billing-secret',
      provider: 'stripe',
      idempotencyKey: 'evt_subscription_created',
      userId,
      subscription: {
        status: 'cancelled',
        planId: 'pro',
        providerSubscriptionId: 'sub_123',
        providerCheckoutId: 'cs_123',
      },
    })

    expect(first).toEqual({ processed: true, duplicate: false })
    expect(duplicate).toEqual({ processed: false, duplicate: true })

    const rows = await t.run(async (ctx) =>
      ctx.db
        .query('subscriptions')
        .withIndex('by_userId', (index) => index.eq('userId', userId))
        .take(10),
    )
    const webhooks = await t.run(async (ctx) =>
      ctx.db
        .query('webhookEvents')
        .withIndex('by_provider_idempotencyKey', (index) =>
          index
            .eq('provider', 'stripe')
            .eq('idempotencyKey', 'evt_subscription_created'),
        )
        .take(10),
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      userId,
      provider: 'stripe',
      status: 'active',
      planId: 'pro',
      providerSubscriptionId: 'sub_123',
      providerCheckoutId: 'cs_123',
    })
    expect(webhooks).toHaveLength(1)
  })

  it('idempotently applies credit-pack webhooks and consumes export credits', async () => {
    vi.stubEnv('BILLING_WEBHOOK_MUTATION_SECRET', 'billing-secret')
    const t = convexTest(schema, modules)
    const userId = 'billing-credit-user'

    await expect(
      t.mutation(api.billing.applyBillingWebhook, {
        secret: 'wrong-secret',
        provider: 'razorpay',
        idempotencyKey: 'order.paid:order_1',
        userId,
        credits: 3,
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'FORBIDDEN' }),
    })

    const first = await t.mutation(api.billing.applyBillingWebhook, {
      secret: 'billing-secret',
      provider: 'razorpay',
      idempotencyKey: 'order.paid:order_1',
      userId,
      credits: 3,
    })
    const duplicate = await t.mutation(api.billing.applyBillingWebhook, {
      secret: 'billing-secret',
      provider: 'razorpay',
      idempotencyKey: 'order.paid:order_1',
      userId,
      credits: 3,
    })
    const consumed = await t.mutation(internal.billing.consumeCreditForExport, {
      userId,
    })

    expect(first).toEqual({ processed: true, duplicate: false })
    expect(duplicate).toEqual({ processed: false, duplicate: true })
    expect(consumed.remaining).toBe(2)

    const ledger = await t.query(api.billing.getCreditLedger, {
      userId,
      limit: 10,
    })
    expect(ledger.current).toBe(2)
    expect(ledger.history).toHaveLength(1)
    expect(ledger.history[0]).toMatchObject({
      userId,
      amount: -1,
      balanceAfter: 2,
      reason: 'export',
    })
  })
})
