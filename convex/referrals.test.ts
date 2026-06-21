import { convexTest } from 'convex-test'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

// convex-test compiles the whole module graph on first use; the first test in
// the file pays that cold-start cost, so allow generous time.
vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })

const ISS = 'https://clerk.test'
const id = (u: string) => `${ISS}|${u}`
const SECRET = 'test-billing-secret'

const asUser = (t: ReturnType<typeof convexTest>, user: string, email?: string) =>
  t.withIdentity({
    tokenIdentifier: id(user),
    subject: user,
    issuer: ISS,
    ...(email ? { email } : {}),
  })

const paySubscription = (
  t: ReturnType<typeof convexTest>,
  user: string,
  providerSubscriptionId: string,
  idempotencyKey: string,
) =>
  t.mutation(api.billing.applyBillingWebhook, {
    secret: SECRET,
    provider: 'stripe',
    idempotencyKey,
    userId: id(user),
    subscription: {
      status: 'active',
      planId: 'pro',
      providerSubscriptionId,
    },
  })

describe('referrals', () => {
  beforeEach(() => {
    vi.stubEnv('BILLING_WEBHOOK_MUTATION_SECRET', SECRET)
  })

  it('issues a stable referral code per user', async () => {
    const t = convexTest(schema, modules)
    const first = await asUser(t, 'alice').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )
    const second = await asUser(t, 'alice').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )
    expect(first.code).toMatch(/^[A-Z0-9]{8}$/)
    expect(second.code).toBe(first.code)
  })

  it('records a referral signup and rejects self / invalid / duplicate', async () => {
    const t = convexTest(schema, modules)
    const { code } = await asUser(t, 'alice').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )

    // self-referral blocked
    expect(
      await asUser(t, 'alice', 'alice@gmail.com').mutation(
        api.referrals.recordReferralSignup,
        { code },
      ),
    ).toEqual({ recorded: false, reason: 'self_referral' })

    // invalid code
    expect(
      await asUser(t, 'bob', 'bob@gmail.com').mutation(
        api.referrals.recordReferralSignup,
        { code: 'ZZZZZZZZ' },
      ),
    ).toEqual({ recorded: false, reason: 'invalid_code' })

    // valid
    expect(
      await asUser(t, 'bob', 'bob@gmail.com').mutation(
        api.referrals.recordReferralSignup,
        { code },
      ),
    ).toEqual({ recorded: true, reason: 'ok' })

    // already referred
    expect(
      await asUser(t, 'bob', 'bob@gmail.com').mutation(
        api.referrals.recordReferralSignup,
        { code },
      ),
    ).toEqual({ recorded: false, reason: 'already_referred' })
  })

  it('unlocks the lifetime reward only after 2 referred users PAY', async () => {
    const t = convexTest(schema, modules)
    const { code } = await asUser(t, 'alice').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )

    await asUser(t, 'bob', 'bob@gmail.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )
    await asUser(t, 'carol', 'carol@gmail.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )

    // Registered but not paid → still locked.
    let status = await asUser(t, 'alice').query(
      api.referrals.getMyReferralStatus,
      {},
    )
    expect(status.pendingCount).toBe(2)
    expect(status.qualifiedCount).toBe(0)
    expect(status.unlocked).toBe(false)

    // First payment → 1 qualified, not unlocked.
    const pay1 = await paySubscription(t, 'bob', 'sub_bob', 'evt_bob')
    expect(pay1.referralUnlock).toBeNull()
    status = await asUser(t, 'alice').query(api.referrals.getMyReferralStatus, {})
    expect(status.qualifiedCount).toBe(1)
    expect(status.unlocked).toBe(false)

    // Second payment → unlock fires exactly once.
    const pay2 = await paySubscription(t, 'carol', 'sub_carol', 'evt_carol')
    expect(pay2.referralUnlock).toEqual({ referrerUserId: id('alice') })

    status = await asUser(t, 'alice').query(api.referrals.getMyReferralStatus, {})
    expect(status.qualifiedCount).toBe(2)
    expect(status.unlocked).toBe(true)
  })

  it('does NOT count disposable-email referrals toward the reward', async () => {
    const t = convexTest(schema, modules)
    const { code } = await asUser(t, 'alice').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )

    // Two burner accounts.
    await asUser(t, 'b1', 'b1@mailinator.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )
    await asUser(t, 'b2', 'b2@yopmail.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )

    const pay1 = await paySubscription(t, 'b1', 'sub_b1', 'evt_b1')
    const pay2 = await paySubscription(t, 'b2', 'sub_b2', 'evt_b2')
    expect(pay1.referralUnlock).toBeNull()
    expect(pay2.referralUnlock).toBeNull()

    const status = await asUser(t, 'alice').query(
      api.referrals.getMyReferralStatus,
      {},
    )
    expect(status.qualifiedCount).toBe(0)
    expect(status.unlocked).toBe(false)
    expect(status.referrals.every((r) => r.status === 'disqualified')).toBe(true)
  })

  it('keeps the reward unlocked permanently (referred churn does not revoke)', async () => {
    const t = convexTest(schema, modules)
    const { code } = await asUser(t, 'alice').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )
    await asUser(t, 'bob', 'bob@gmail.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )
    await asUser(t, 'carol', 'carol@gmail.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )
    await paySubscription(t, 'bob', 'sub_bob', 'evt_bob')
    await paySubscription(t, 'carol', 'sub_carol', 'evt_carol')

    // A referred user cancels.
    await t.mutation(api.billing.applyBillingWebhook, {
      secret: SECRET,
      provider: 'stripe',
      idempotencyKey: 'evt_bob_cancel',
      userId: id('bob'),
      subscription: {
        status: 'cancelled',
        planId: 'pro',
        providerSubscriptionId: 'sub_bob',
      },
    })

    const status = await asUser(t, 'alice').query(
      api.referrals.getMyReferralStatus,
      {},
    )
    expect(status.unlocked).toBe(true)
  })

  it('exposes server-gated discount context and marks discount applied', async () => {
    const t = convexTest(schema, modules)
    const { code } = await asUser(t, 'alice').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )
    await asUser(t, 'bob', 'bob@gmail.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )
    await asUser(t, 'carol', 'carol@gmail.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )
    await paySubscription(t, 'bob', 'sub_bob', 'evt_bob')
    await paySubscription(t, 'carol', 'sub_carol', 'evt_carol')

    // Referrer alice subscribes too.
    await paySubscription(t, 'alice', 'sub_alice', 'evt_alice')

    // Wrong secret is rejected.
    await expect(
      t.query(api.referrals.getDiscountApplicationContext, {
        secret: 'nope',
        userId: id('alice'),
      }),
    ).rejects.toThrow()

    const ctx = await t.query(api.referrals.getDiscountApplicationContext, {
      secret: SECRET,
      userId: id('alice'),
    })
    expect(ctx.unlocked).toBe(true)
    expect(ctx.discountApplied).toBe(false)
    expect(ctx.subscription).toEqual({
      provider: 'stripe',
      providerSubscriptionId: 'sub_alice',
    })

    await t.mutation(api.referrals.markReferralDiscountApplied, {
      secret: SECRET,
      userId: id('alice'),
      provider: 'stripe',
      providerDiscountId: 'shipfast_ref_50_forever',
      subscriptionId: 'sub_alice',
    })

    const after = await t.query(api.referrals.getDiscountApplicationContext, {
      secret: SECRET,
      userId: id('alice'),
    })
    expect(after.discountApplied).toBe(true)
  })

  it('immediately qualifies a referral recorded after the referred user already paid', async () => {
    const t = convexTest(schema, modules)
    const { code } = await asUser(t, 'alice').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )

    // Bob pays BEFORE the ref code is recorded.
    await paySubscription(t, 'bob', 'sub_bob', 'evt_bob')
    const res = await asUser(t, 'bob', 'bob@gmail.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )
    expect(res).toEqual({ recorded: true, reason: 'ok' })

    const status = await asUser(t, 'alice').query(
      api.referrals.getMyReferralStatus,
      {},
    )
    expect(status.qualifiedCount).toBe(1)
  })
})
