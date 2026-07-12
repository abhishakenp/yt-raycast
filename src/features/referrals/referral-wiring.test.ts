// @vitest-environment jsdom
//
// Behavioral regression guards for the referral / sponsorship program.
// These exercise the real APIs (schema object, convex mutations, pure
// helpers, the Stripe discount call, the disposable-email classifier, and the
// client capture hook) instead of grepping source files for identifiers.

import {
  convexTest,
  type TestConvex,
  type TestConvexForDataModel,
} from 'convex-test'
import type { DataModelFromSchemaDefinition } from 'convex/server'
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '../../../convex/_generated/api'
import schema from '../../../convex/schema'
import {
  classifyReferralEmail,
  isDisposableEmail,
} from '../../../convex/lib/disposable_email'
import {
  REFERRAL_DISCOUNT_PERCENT,
  REFERRAL_THRESHOLD,
  computeRewardState,
} from '../../../convex/lib/referral_helpers'
import { ensureStripeReferralCoupon } from './server/referral-discount'
import { useReferralCapture } from './hooks/useReferralCapture'
import { REFERRAL_PENDING_KEY, postReferralRecord } from './lib/referral-client'

// convex-test compiles the whole convex module graph on first use; the first
// test pays that cold-start cost, so allow generous time.
vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })

const modules = import.meta.glob('../../../convex/**/*.ts')

const ISS = 'https://clerk.test'
function id(user: string): string {
  return `${ISS}|${user}`
}
const SECRET = 'test-billing-secret'

type TestDataModel = DataModelFromSchemaDefinition<typeof schema>
type TestCtx = TestConvex<typeof schema>
type TestCtxWithIdentity = TestConvexForDataModel<TestDataModel>

function asUser(t: TestCtx, user: string, email?: string): TestCtxWithIdentity {
  return t.withIdentity({
    tokenIdentifier: id(user),
    subject: user,
    issuer: ISS,
    ...(email ? { email } : {}),
  })
}

function paySubscription(
  t: TestCtx,
  user: string,
  providerSubscriptionId: string,
  idempotencyKey: string,
) {
  return t.mutation(api.billing.applyBillingWebhook, {
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
}

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function setClerk(clerk: unknown): void {
  ;(window as unknown as { Clerk?: unknown }).Clerk = clerk
}

function clearClerk(): void {
  delete (window as unknown as { Clerk?: unknown }).Clerk
}

describe('billing webhook referral qualification', () => {
  beforeEach(() => {
    vi.stubEnv('BILLING_WEBHOOK_MUTATION_SECRET', SECRET)
  })

  it('returns referralUnlock exactly when the threshold is reached', async () => {
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

    // First paying referral → 1 qualified, still locked.
    const pay1 = await paySubscription(t, 'bob', 'sub_bob', 'evt_bob')
    expect(pay1.referralUnlock).toBeNull()

    // Second paying referral → unlock fires with the referrer id.
    const pay2 = await paySubscription(t, 'carol', 'sub_carol', 'evt_carol')
    expect(pay2.referralUnlock).toEqual({ referrerUserId: id('alice') })
  })
})

describe('referral qualification on payment', () => {
  beforeEach(() => {
    vi.stubEnv('BILLING_WEBHOOK_MUTATION_SECRET', SECRET)
  })

  it('disqualifies disposable-email referrals and never unlocks', async () => {
    const t = convexTest(schema, modules)
    const { code } = await asUser(t, 'alice').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )
    await asUser(t, 'bob', 'bob@mailinator.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )
    await asUser(t, 'carol', 'carol@yopmail.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )

    const pay1 = await paySubscription(t, 'bob', 'sub_bob', 'evt_bob')
    const pay2 = await paySubscription(t, 'carol', 'sub_carol', 'evt_carol')
    expect(pay1.referralUnlock).toBeNull()
    expect(pay2.referralUnlock).toBeNull()

    const status = await asUser(t, 'alice').query(
      api.referrals.getMyReferralStatus,
      {},
    )
    expect(status.qualifiedCount).toBe(0)
    expect(status.unlocked).toBe(false)
    expect(status.referrals.every((r) => r.status === 'disqualified')).toBe(
      true,
    )
  })

  it('qualifies a real-email referral on payment', async () => {
    const t = convexTest(schema, modules)
    const { code } = await asUser(t, 'alice').mutation(
      api.referrals.getOrCreateMyReferralCode,
      {},
    )
    await asUser(t, 'bob', 'bob@gmail.com').mutation(
      api.referrals.recordReferralSignup,
      { code },
    )

    const pay = await paySubscription(t, 'bob', 'sub_bob', 'evt_bob')
    // Only 1 qualified — threshold is 2, so no unlock yet.
    expect(pay.referralUnlock).toBeNull()

    const status = await asUser(t, 'alice').query(
      api.referrals.getMyReferralStatus,
      {},
    )
    expect(status.qualifiedCount).toBe(1)
    expect(status.referrals.some((r) => r.status === 'qualified')).toBe(true)
  })
})

describe('referral helpers', () => {
  it('exposes the unlock threshold and discount percent constants', () => {
    expect(REFERRAL_THRESHOLD).toBe(2)
    expect(REFERRAL_DISCOUNT_PERCENT).toBe(50)
  })

  it('unlock is monotonic — once unlocked it stays unlocked', () => {
    // Below threshold, never unlocked → locked.
    expect(computeRewardState(0, false)).toEqual({
      unlocked: false,
      justUnlocked: false,
    })
    // Reaches threshold → unlocks now.
    expect(computeRewardState(REFERRAL_THRESHOLD, false)).toEqual({
      unlocked: true,
      justUnlocked: true,
    })
    // Count drops back to zero but already unlocked → stays unlocked, not "just".
    expect(computeRewardState(0, true)).toEqual({
      unlocked: true,
      justUnlocked: false,
    })
  })
})

describe('referral discount coupon', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates a 50%-off forever coupon at the provider', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(okResponse({ id: 'shipfast_ref_50_forever' }))
    vi.stubGlobal('fetch', fetchMock)

    const env: NodeJS.ProcessEnv = { STRIPE_SECRET_KEY: 'sk_test' }
    const couponId = await ensureStripeReferralCoupon(env)

    expect(couponId).toBe('shipfast_ref_50_forever')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0] as [
      string,
      RequestInit & { body: URLSearchParams },
    ]
    expect(url).toBe('https://api.stripe.com/v1/coupons')
    expect(init.method).toBe('POST')
    const body = init.body.toString()
    expect(body).toContain('percent_off=50')
    expect(body).toContain('duration=forever')
  })
})

describe('disposable email detection', () => {
  it('blocks known burner domains', () => {
    for (const domain of [
      'mailinator.com',
      'yopmail.com',
      'guerrillamail.com',
      'temp-mail.org',
    ]) {
      expect(isDisposableEmail(`user@${domain}`)).toBe(true)
    }
  })

  it('accepts real email domains', () => {
    expect(isDisposableEmail('user@gmail.com')).toBe(false)
  })

  it('classifyReferralEmail marks disposable emails as not acceptable', () => {
    const burner = classifyReferralEmail('x@mailinator.com')
    expect(burner.disposable).toBe(true)
    expect(burner.acceptable).toBe(false)

    const real = classifyReferralEmail('x@gmail.com')
    expect(real.disposable).toBe(false)
    expect(real.acceptable).toBe(true)
  })
})

describe('referral client + capture hook', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    localStorage.clear()
    clearClerk()
  })

  it('postReferralRecord posts to /api/referrals/record with the code', async () => {
    setClerk({
      loaded: true,
      user: { primaryEmailAddress: { emailAddress: 'bob@gmail.com' } },
      session: { getToken: async () => 'tok' },
    })
    const fetchMock = vi
      .fn()
      .mockResolvedValue(okResponse({ recorded: true, reason: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await postReferralRecord('ABC12345')
    expect(result).toEqual({ recorded: true, reason: 'ok' })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/referrals/record')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer tok',
      'Content-Type': 'application/json',
    })
    expect(JSON.parse(init.body as string).code).toBe('ABC12345')
  })

  it('useReferralCapture calls the API once signed in with a pending code', async () => {
    localStorage.setItem(REFERRAL_PENDING_KEY, 'ABC12345')
    const fetchMock = vi
      .fn()
      .mockResolvedValue(okResponse({ recorded: true, reason: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)
    setClerk({
      loaded: true,
      user: { primaryEmailAddress: { emailAddress: 'bob@gmail.com' } },
      session: { getToken: async () => 'tok' },
    })

    renderHook(() => useReferralCapture())

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/referrals/record')
    expect(JSON.parse(init.body as string).code).toBe('ABC12345')
  })
})
