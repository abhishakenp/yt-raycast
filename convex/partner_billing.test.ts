/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import type { FunctionArgs } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const ISSUER = 'https://clerk.test'
const SECRET = 'partner-billing-secret'

vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })

function userId(subject: string): string {
  return `${ISSUER}|${subject}`
}

function asUser(t: ReturnType<typeof convexTest>, subject: string) {
  return t.withIdentity({
    email: `${subject}@example.com`,
    issuer: ISSUER,
    subject,
    tokenIdentifier: userId(subject),
  })
}

async function addRazorpaySubscription(
  t: ReturnType<typeof convexTest>,
  subject: string,
  providerSubscriptionId: string,
): Promise<void> {
  await t.mutation(api.billing.applyBillingWebhook, {
    idempotencyKey: `subscription:${providerSubscriptionId}`,
    provider: 'razorpay',
    secret: SECRET,
    subscription: {
      planId: 'pro',
      providerSubscriptionId,
      status: 'active',
    },
    userId: userId(subject),
  })
}

function applySale(
  t: ReturnType<typeof convexTest>,
  invoiceId: string,
  providerSubscriptionId = 'sub_123',
) {
  return t.mutation(api.partners.applyPartnerBillingWebhook, {
    idempotencyKey: `invoice.paid:${invoiceId}`,
    partnerEvent: {
      amount: 4900,
      currency: 'inr',
      invoiceId,
      kind: 'sale',
      providerPaymentId: `pay_${invoiceId}`,
      providerSubscriptionId,
    },
    provider: 'razorpay',
    secret: SECRET,
  })
}

describe('partner billing events', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubEnv('BILLING_WEBHOOK_MUTATION_SECRET', SECRET)
    vi.stubEnv('DUB_PARTNERS_ENABLED', 'true')
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('resolves the subscription owner and enqueues each renewal once', async () => {
    const t = convexTest(schema, modules)
    await addRazorpaySubscription(t, 'alice', 'sub_123')
    await asUser(t, 'alice').mutation(api.partners.claimDubAttribution, {
      clickId: 'click_123',
    })

    await expect(applySale(t, 'inv_1')).resolves.toEqual({
      processed: true,
      queued: true,
    })
    await expect(applySale(t, 'inv_1')).resolves.toEqual({
      processed: false,
      queued: false,
    })
    await expect(applySale(t, 'inv_2')).resolves.toEqual({
      processed: true,
      queued: true,
    })

    const sales = await t.run(async (ctx) =>
      ctx.db
        .query('dubEventOutbox')
        .withIndex('by_userId', (index) => index.eq('userId', userId('alice')))
        .take(10),
    )
    expect(sales.filter((event) => event.kind === 'sale')).toMatchObject([
      {
        amount: 4900,
        currency: 'inr',
        invoiceId: 'inv_1',
        providerPaymentId: 'pay_inv_1',
        providerSubscriptionId: 'sub_123',
      },
      {
        invoiceId: 'inv_2',
      },
    ])
  })

  it('does not enqueue sales for a native-referral customer', async () => {
    const t = convexTest(schema, modules)
    const { code } = await asUser(t, 'owner').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )
    await asUser(t, 'alice').mutation(api.referrals.recordReferralSignup, {
      code,
    })
    await addRazorpaySubscription(t, 'alice', 'sub_123')

    await expect(applySale(t, 'inv_native')).resolves.toEqual({
      processed: true,
      queued: false,
    })

    const sales = await t.run(async (ctx) =>
      ctx.db
        .query('dubEventOutbox')
        .withIndex('by_kind_and_invoiceId', (index) =>
          index.eq('kind', 'sale').eq('invoiceId', 'inv_native'),
        )
        .take(2),
    )
    expect(sales).toHaveLength(0)
  })

  it('rejects a sale until its provider subscription exists', async () => {
    const t = convexTest(schema, modules)

    await expect(applySale(t, 'inv_missing', 'sub_missing')).rejects.toThrow(
      'Subscription was not found',
    )
    const webhooks = await t.run(async (ctx) =>
      ctx.db
        .query('webhookEvents')
        .withIndex('by_provider_idempotencyKey', (index) =>
          index
            .eq('provider', 'razorpay')
            .eq('idempotencyKey', 'invoice.paid:inv_missing'),
        )
        .take(2),
    )
    expect(webhooks).toHaveLength(0)
  })

  it('links refunds to the original sale and enqueues them once', async () => {
    const t = convexTest(schema, modules)
    await addRazorpaySubscription(t, 'alice', 'sub_123')
    await asUser(t, 'alice').mutation(api.partners.claimDubAttribution, {
      clickId: 'click_123',
    })
    await applySale(t, 'inv_refund')

    const refundArgs = {
      idempotencyKey: 'refund.processed:rfnd_123',
      partnerEvent: {
        amount: 1200,
        currency: 'inr',
        invoiceId: 'inv_refund',
        kind: 'refund',
        providerPaymentId: 'pay_inv_refund',
        remainingAmount: 3700,
        refundId: 'rfnd_123',
      },
      provider: 'razorpay',
      secret: SECRET,
    } satisfies FunctionArgs<typeof api.partners.applyPartnerBillingWebhook>
    await expect(
      t.mutation(api.partners.applyPartnerBillingWebhook, refundArgs),
    ).resolves.toEqual({ processed: true, queued: true })
    await expect(
      t.mutation(api.partners.applyPartnerBillingWebhook, refundArgs),
    ).resolves.toEqual({ processed: false, queued: false })

    const refund = await t.run(async (ctx) =>
      ctx.db
        .query('dubEventOutbox')
        .withIndex('by_idempotencyKey', (index) =>
          index.eq('idempotencyKey', 'dub:refund:razorpay:rfnd_123'),
        )
        .unique(),
    )
    expect(refund).toMatchObject({
      amount: 1200,
      currency: 'inr',
      invoiceId: 'inv_refund',
      kind: 'refund',
      remainingAmount: 3700,
      userId: userId('alice'),
    })
  })

  it('rejects a blank refund id without recording partial state', async () => {
    const t = convexTest(schema, modules)
    await addRazorpaySubscription(t, 'alice', 'sub_123')
    await asUser(t, 'alice').mutation(api.partners.claimDubAttribution, {
      clickId: 'click_123',
    })
    await applySale(t, 'inv_blank_refund')

    await expect(
      t.mutation(api.partners.applyPartnerBillingWebhook, {
        idempotencyKey: 'refund.processed:blank',
        partnerEvent: {
          amount: 4900,
          currency: 'inr',
          invoiceId: 'inv_blank_refund',
          kind: 'refund',
          remainingAmount: 0,
          refundId: '   ',
        },
        provider: 'razorpay',
        secret: SECRET,
      }),
    ).rejects.toThrow('Partner billing event is invalid')

    const state = await t.run(async (ctx) => ({
      refunds: await ctx.db
        .query('dubEventOutbox')
        .withIndex('by_kind_and_invoiceId', (index) =>
          index.eq('kind', 'refund').eq('invoiceId', 'inv_blank_refund'),
        )
        .take(2),
      webhooks: await ctx.db
        .query('webhookEvents')
        .withIndex('by_provider_idempotencyKey', (index) =>
          index
            .eq('provider', 'razorpay')
            .eq('idempotencyKey', 'refund.processed:blank'),
        )
        .take(2),
    }))

    expect(state).toEqual({ refunds: [], webhooks: [] })
  })
})
