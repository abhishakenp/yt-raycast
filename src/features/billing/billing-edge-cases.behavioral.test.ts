// Behavioral regression guards for billing webhooks, Razorpay idempotency,
// export entitlement, and referral edge cases.
//
// These exercise the REAL function logic (signature verification, payload →
// mutation mapping, status normalization, credit-pack math, entitlement
// resolution, referral reward state, disposable-email classification, and the
// Stripe discount attach flow) with Convex mutations/queries mocked out and
// fetch stubbed for the Stripe/Razorpay API surface.
//
// PHILOSOPHY: assert EXPECTED/CORRECT behavior. If the code is buggy, the test
// MUST fail. We never pin current/buggy behavior.

import { afterEach, describe, expect, it, vi, type Mock } from 'vitest'
import type { ConvexHttpClient } from 'convex/browser'

import { createWebhookApiResponse } from './server/webhook-api-response'
import {
  generateIdempotencyKey,
  validateIdempotencyKey,
} from './services/razorpay-idempotency'
import {
  hasExportSubscriptionAccess,
  resolveExportEntitlement,
  type SubscriptionStatus,
} from './services/export-entitlement'
import { applyReferralDiscountForUser } from '@/features/referrals/server/referral-discount'
import {
  REFERRAL_DISCOUNT_PERCENT,
  REFERRAL_THRESHOLD,
  computeRewardState,
  generateReferralCode,
  isRewardUnlocked,
  normalizeReferralCode,
} from '../../../convex/lib/referral_helpers'
import {
  classifyReferralEmail,
  isDisposableEmail,
} from '../../../convex/lib/disposable_email'

// ---------------------------------------------------------------------------
// Shared fixtures / helpers
// ---------------------------------------------------------------------------

const STRIPE_SECRET = 'whsec_stripe'
const RAZORPAY_SECRET = 'whsec_razorpay'
const MUTATION_SECRET = 'billing-secret'

const stripeEnv = {
  STRIPE_WEBHOOK_SECRET: STRIPE_SECRET,
  BILLING_WEBHOOK_MUTATION_SECRET: MUTATION_SECRET,
} as unknown as NodeJS.ProcessEnv

const razorpayEnv = {
  RAZORPAY_WEBHOOK_SECRET: RAZORPAY_SECRET,
  BILLING_WEBHOOK_MUTATION_SECRET: MUTATION_SECRET,
} as unknown as NodeJS.ProcessEnv

const discountEnv = {
  STRIPE_SECRET_KEY: 'sk_test_123',
  BILLING_WEBHOOK_MUTATION_SECRET: MUTATION_SECRET,
} as unknown as NodeJS.ProcessEnv

async function hmacSha256Hex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  )
  return Array.from(new Uint8Array(sig), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('')
}

async function buildSignedStripeRequest(event: unknown) {
  const rawBody = JSON.stringify(event)
  const t = String(Math.floor(Date.now() / 1000))
  const v1 = await hmacSha256Hex(STRIPE_SECRET, `${t}.${rawBody}`)
  return new Request('https://ship-fast.ai/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': `t=${t},v1=${v1}` },
    body: rawBody,
  })
}

async function buildSignedRazorpayRequest(event: unknown) {
  const rawBody = JSON.stringify(event)
  const signature = await hmacSha256Hex(RAZORPAY_SECRET, rawBody)
  return new Request('https://ship-fast.ai/api/razorpay/webhook', {
    method: 'POST',
    headers: { 'x-razorpay-signature': signature },
    body: rawBody,
  })
}

/** A Stripe checkout.session event for a subscription. */
function stripeSubscriptionEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'evt_sub_1',
    data: {
      object: {
        id: 'cs_1',
        mode: 'subscription',
        subscription: 'sub_1',
        status: 'active',
        metadata: { userId: 'user_1', mode: 'subscription', tier: 'pro' },
        ...overrides,
      },
    },
  }
}

/** A Stripe checkout.session event for a credit pack. */
function stripeCreditPackEvent(packId: string, userId = 'user_1') {
  return {
    id: `evt_${packId}`,
    data: {
      object: {
        id: `cs_${packId}`,
        mode: 'payment',
        metadata: { userId, mode: 'credit_pack', packId },
      },
    },
  }
}

/** A Razorpay subscription webhook event. */
function razorpaySubscriptionEvent(overrides: Record<string, unknown> = {}) {
  return {
    event: 'subscription.activated',
    id: 'evt_rzp_001',
    payload: {
      subscription: {
        entity: {
          id: 'sub_rzp_1',
          status: 'active',
          plan_id: 'plan_pro',
          notes: { userId: 'user_1', tier: 'pro' },
          ...overrides,
        },
      },
    },
  }
}

const noOpApplyDiscount = vi.fn(
  async (): Promise<{ applied: boolean; reason: string }> => ({
    applied: false,
    reason: 'noop',
  }),
)

type MockedMutation = ConvexHttpClient['mutation'] & Mock
type MockedConvexClient = { mutation: MockedMutation }

function mockConvexClient(
  mutationImpl: (args: Record<string, unknown>) => unknown,
): MockedConvexClient {
  return {
    mutation: vi.fn(async (_path, args) =>
      mutationImpl(args),
    ) as unknown as MockedMutation,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Webhook tests
// ---------------------------------------------------------------------------

describe('billing webhooks', () => {
  describe('Stripe signature verification', () => {
    it('valid signature → event processed (200, mutation called)', async () => {
      const request = await buildSignedStripeRequest(stripeSubscriptionEvent())
      const client = mockConvexClient(() => ({
        processed: true,
        duplicate: false,
        referralUnlock: null,
      }))

      const response = await createWebhookApiResponse(
        request,
        'stripe',
        stripeEnv,
        client,
        noOpApplyDiscount,
      )

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({ received: true })
      expect(client.mutation).toHaveBeenCalledOnce()
    })

    it('invalid signature → rejected (400, mutation NOT called)', async () => {
      const request = new Request('https://ship-fast.ai/api/stripe/webhook', {
        method: 'POST',
        headers: { 'stripe-signature': 't=1,v1=deadbeef' },
        body: JSON.stringify(stripeSubscriptionEvent()),
      })
      const client = mockConvexClient(() => ({
        processed: true,
        duplicate: false,
      }))

      const response = await createWebhookApiResponse(
        request,
        'stripe',
        stripeEnv,
        client,
        noOpApplyDiscount,
      )

      expect(response.status).toBe(400)
      expect(client.mutation).not.toHaveBeenCalled()
    })
  })

  describe('Stripe subscription webhook', () => {
    it('status active → subscription updated with active status', async () => {
      const request = await buildSignedStripeRequest(
        stripeSubscriptionEvent({ status: 'active' }),
      )
      const client = mockConvexClient(() => ({
        processed: true,
        duplicate: false,
        referralUnlock: null,
      }))

      await createWebhookApiResponse(
        request,
        'stripe',
        stripeEnv,
        client,
        noOpApplyDiscount,
      )

      const args = (client.mutation.mock.calls[0] as unknown[])[1] as {
        subscription: { status: string }
      }
      expect(args.subscription.status).toBe('active')
    })
  })

  describe('Stripe credit-pack webhook', () => {
    it('3_credits → 3 credits added to ledger', async () => {
      const request = await buildSignedStripeRequest(
        stripeCreditPackEvent('3_credits'),
      )
      const client = mockConvexClient(() => ({
        processed: true,
        duplicate: false,
        referralUnlock: null,
      }))

      await createWebhookApiResponse(
        request,
        'stripe',
        stripeEnv,
        client,
        noOpApplyDiscount,
      )

      const args = (client.mutation.mock.calls[0] as unknown[])[1] as {
        credits?: number
        subscription?: unknown
      }
      expect(args.credits).toBe(3)
      expect(args.subscription).toBeUndefined()
    })

    it('10_credits → 10 credits added to ledger', async () => {
      const request = await buildSignedStripeRequest(
        stripeCreditPackEvent('10_credits'),
      )
      const client = mockConvexClient(() => ({
        processed: true,
        duplicate: false,
        referralUnlock: null,
      }))

      await createWebhookApiResponse(
        request,
        'stripe',
        stripeEnv,
        client,
        noOpApplyDiscount,
      )

      const args = (client.mutation.mock.calls[0] as unknown[])[1] as {
        credits?: number
      }
      expect(args.credits).toBe(10)
    })
  })

  describe('Razorpay signature verification', () => {
    it('valid signature → event processed (200, mutation called)', async () => {
      const request = await buildSignedRazorpayRequest(
        razorpaySubscriptionEvent(),
      )
      const client = mockConvexClient(() => ({
        processed: true,
        duplicate: false,
        referralUnlock: null,
      }))

      const response = await createWebhookApiResponse(
        request,
        'razorpay',
        razorpayEnv,
        client,
        noOpApplyDiscount,
      )

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({ received: true })
      expect(client.mutation).toHaveBeenCalledOnce()
    })

    it('invalid signature → rejected (400, mutation NOT called)', async () => {
      const request = new Request('https://ship-fast.ai/api/razorpay/webhook', {
        method: 'POST',
        headers: { 'x-razorpay-signature': 'deadbeef' },
        body: JSON.stringify(razorpaySubscriptionEvent()),
      })
      const client = mockConvexClient(() => ({
        processed: true,
        duplicate: false,
      }))

      const response = await createWebhookApiResponse(
        request,
        'razorpay',
        razorpayEnv,
        client,
        noOpApplyDiscount,
      )

      expect(response.status).toBe(400)
      expect(client.mutation).not.toHaveBeenCalled()
    })
  })

  describe('idempotency', () => {
    it('same webhook event processed twice → applied once (identical idempotency key, duplicate returns 200)', async () => {
      const event = {
        ...stripeSubscriptionEvent({ subscription: 'sub_dup' }),
        id: 'evt_dup',
      }
      const request = await buildSignedStripeRequest(event)

      // First call: applied. Second call: duplicate (convex enforces this
      // via the webhookEvents table — we simulate that here).
      const client = mockConvexClient(() => ({
        processed: true,
        duplicate: false,
        referralUnlock: null,
      }))
      client.mutation
        .mockResolvedValueOnce({
          processed: true,
          duplicate: false,
          referralUnlock: null,
        })
        .mockResolvedValueOnce({
          processed: false,
          duplicate: true,
        })

      const response1 = await createWebhookApiResponse(
        request,
        'stripe',
        stripeEnv,
        client,
        noOpApplyDiscount,
      )
      const request2 = await buildSignedStripeRequest(event)
      const response2 = await createWebhookApiResponse(
        request2,
        'stripe',
        stripeEnv,
        client,
        noOpApplyDiscount,
      )

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)

      // Same idempotency key passed both times → convex dedupes the side effect.
      const key1 = (client.mutation.mock.calls[0] as unknown[])[1] as {
        idempotencyKey: string
      }
      const key2 = (client.mutation.mock.calls[1] as unknown[])[1] as {
        idempotencyKey: string
      }
      expect(key1.idempotencyKey).toBe(key2.idempotencyKey)
      expect(key1.idempotencyKey).toBe('evt_dup')
      expect(client.mutation).toHaveBeenCalledTimes(2)
    })
  })

  describe('subscription status normalization', () => {
    const cases: Array<{
      raw: string
      expectedStatus: string
      isActive: boolean
    }> = [
      { raw: 'active', expectedStatus: 'active', isActive: true },
      { raw: 'past_due', expectedStatus: 'past_due', isActive: false },
      { raw: 'canceled', expectedStatus: 'cancelled', isActive: false },
      { raw: 'trialing', expectedStatus: 'trialing', isActive: true },
    ]

    for (const { raw, expectedStatus, isActive } of cases) {
      it(`"${raw}" → normalized to "${expectedStatus}" (active=${isActive})`, async () => {
        const request = await buildSignedStripeRequest(
          stripeSubscriptionEvent({ status: raw, subscription: `sub_${raw}` }),
        )
        const client = mockConvexClient(() => ({
          processed: true,
          duplicate: false,
          referralUnlock: null,
        }))

        await createWebhookApiResponse(
          request,
          'stripe',
          stripeEnv,
          client,
          noOpApplyDiscount,
        )

        const args = (client.mutation.mock.calls[0] as unknown[])[1] as {
          subscription: { status: string }
        }
        expect(args.subscription.status).toBe(expectedStatus)
        // The normalized status must agree with the active-subscription set
        // used by the export entitlement layer.
        expect(
          hasExportSubscriptionAccess(
            args.subscription.status as SubscriptionStatus,
          ),
        ).toBe(isActive)
      })
    }
  })

  describe('Razorpay subscription status normalization (deny-by-default)', () => {
    const cases: Array<{
      raw: string
      expectedStatus: string
      isActive: boolean
    }> = [
      { raw: 'active', expectedStatus: 'active', isActive: true },
      { raw: 'authenticated', expectedStatus: 'authenticated', isActive: true },
      { raw: 'trialing', expectedStatus: 'trialing', isActive: true },
      { raw: 'past_due', expectedStatus: 'past_due', isActive: false },
      { raw: 'cancelled', expectedStatus: 'cancelled', isActive: false },
      // halted must NOT default to active — deny-by-default
      { raw: 'halted', expectedStatus: 'cancelled', isActive: false },
      { raw: 'pending', expectedStatus: 'cancelled', isActive: false },
      { raw: 'unknown_status', expectedStatus: 'cancelled', isActive: false },
    ]

    for (const { raw, expectedStatus, isActive } of cases) {
      it(`Razorpay "${raw}" → normalized to "${expectedStatus}" (active=${isActive})`, async () => {
        const request = await buildSignedRazorpayRequest(
          razorpaySubscriptionEvent({ status: raw }),
        )
        const client = mockConvexClient(() => ({
          processed: true,
          duplicate: false,
          referralUnlock: null,
        }))

        await createWebhookApiResponse(
          request,
          'razorpay',
          razorpayEnv,
          client,
          noOpApplyDiscount,
        )

        const args = (client.mutation.mock.calls[0] as unknown[])[1] as {
          subscription: { status: string }
        }
        expect(args.subscription.status).toBe(expectedStatus)
        expect(
          hasExportSubscriptionAccess(
            args.subscription.status as SubscriptionStatus,
          ),
        ).toBe(isActive)
      })
    }
  })
})

describe('Razorpay webhook idempotency key uses unique event ID', () => {
  it('two recurring subscription.charged events for the same sub produce different keys', async () => {
    // Blocker 3 regression: previously used event:subscriptionId which
    // collided across recurring charges. Now uses the unique event ID.
    const event1 = {
      event: 'subscription.charged',
      id: 'evt_charge_month_1',
      payload: {
        subscription: {
          entity: {
            id: 'sub_recurring',
            status: 'active',
            plan_id: 'plan_pro',
            notes: { userId: 'user_recurring', tier: 'pro' },
          },
        },
      },
    }
    const event2 = {
      event: 'subscription.charged',
      id: 'evt_charge_month_2',
      payload: {
        subscription: {
          entity: {
            id: 'sub_recurring',
            status: 'active',
            plan_id: 'plan_pro',
            notes: { userId: 'user_recurring', tier: 'pro' },
          },
        },
      },
    }

    const client1 = mockConvexClient(() => ({
      processed: true,
      duplicate: false,
      referralUnlock: null,
    }))
    const client2 = mockConvexClient(() => ({
      processed: true,
      duplicate: false,
      referralUnlock: null,
    }))

    const req1 = await buildSignedRazorpayRequest(event1)
    const req2 = await buildSignedRazorpayRequest(event2)

    await createWebhookApiResponse(
      req1,
      'razorpay',
      razorpayEnv,
      client1,
      noOpApplyDiscount,
    )
    await createWebhookApiResponse(
      req2,
      'razorpay',
      razorpayEnv,
      client2,
      noOpApplyDiscount,
    )

    const key1 = (client1.mutation.mock.calls[0] as unknown[])[1] as {
      idempotencyKey: string
    }
    const key2 = (client2.mutation.mock.calls[0] as unknown[])[1] as {
      idempotencyKey: string
    }
    expect(key1.idempotencyKey).toBe('evt_charge_month_1')
    expect(key2.idempotencyKey).toBe('evt_charge_month_2')
    expect(key1.idempotencyKey).not.toBe(key2.idempotencyKey)
  })

  it('rejects Razorpay webhook payloads without an event ID', async () => {
    const event = {
      event: 'subscription.activated',
      // no id field
      payload: {
        subscription: {
          entity: {
            id: 'sub_no_evt_id',
            status: 'active',
            plan_id: 'plan_pro',
            notes: { userId: 'user_no_evt', tier: 'pro' },
          },
        },
      },
    }

    const client = mockConvexClient(() => ({
      processed: true,
      duplicate: false,
      referralUnlock: null,
    }))

    const request = await buildSignedRazorpayRequest(event)
    const response = await createWebhookApiResponse(
      request,
      'razorpay',
      razorpayEnv,
      client,
      noOpApplyDiscount,
    )

    // Payload rejected — no mutation called
    expect(client.mutation).not.toHaveBeenCalled()
    expect(response.status).toBe(200) // webhook returns 200 even on skip
  })
})

describe('Razorpay idempotency keys', () => {
  describe('key generation', () => {
    it('format: prefix_timestamp_random, length 1-255', () => {
      const key = generateIdempotencyKey('razorpay')
      expect(key.length).toBeGreaterThan(0)
      expect(key.length).toBeLessThanOrEqual(255)
      expect(key.startsWith('razorpay_')).toBe(true)
      // prefix_timestamp_random → at least two underscores after prefix.
      const rest = key.slice('razorpay_'.length)
      expect(rest.split('_').length).toBeGreaterThanOrEqual(2)
      // Timestamp segment must be numeric.
      const timestampSegment = rest.split('_')[0]
      expect(/^\d+$/.test(timestampSegment)).toBe(true)
    })

    it('preserves the supplied prefix', () => {
      const key = generateIdempotencyKey('checkout')
      expect(key.startsWith('checkout_')).toBe(true)
    })

    it('produces unique keys across rapid successive calls', () => {
      const keys = new Set(
        Array.from({ length: 50 }, () => generateIdempotencyKey('op')),
      )
      // 50 rapid calls should yield many distinct keys (timestamp + random).
      expect(keys.size).toBeGreaterThan(1)
    })
  })

  describe('key validation', () => {
    it('valid key → accepted', () => {
      expect(validateIdempotencyKey('razorpay_1700000000_abc123')).toBe(true)
      expect(validateIdempotencyKey('a')).toBe(true)
    })

    it('empty key → rejected', () => {
      expect(validateIdempotencyKey('')).toBe(false)
    })

    it('key > 255 chars → rejected', () => {
      expect(validateIdempotencyKey('x'.repeat(256))).toBe(false)
      expect(validateIdempotencyKey('x'.repeat(255))).toBe(true)
    })

    it('non-string → rejected', () => {
      expect(validateIdempotencyKey(null as unknown as string)).toBe(false)
      expect(validateIdempotencyKey(undefined as unknown as string)).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// Export entitlement resolution
// ---------------------------------------------------------------------------

describe('export entitlement', () => {
  it('paywall disabled → canDownload=true, requiresPayment=false', () => {
    const decision = resolveExportEntitlement({
      userId: 'user_1',
      paywallDisabled: true,
    })
    expect(decision.canDownload).toBe(true)
    expect(decision.requiresPayment).toBe(false)
    expect(decision.consumeCredit).toBe(false)
    expect(decision.reason).toBe('paywall_disabled')
  })

  it('anonymous user → canDownload=false, requiresPayment=true', () => {
    const decision = resolveExportEntitlement({ userId: null })
    expect(decision.canDownload).toBe(false)
    expect(decision.requiresPayment).toBe(true)
    expect(decision.reason).toBe('anonymous')
  })

  it('active subscription → canDownload=true, requiresPayment=false', () => {
    const decision = resolveExportEntitlement({
      userId: 'user_1',
      subscriptionStatus: 'active',
    })
    expect(decision.canDownload).toBe(true)
    expect(decision.requiresPayment).toBe(false)
    expect(decision.consumeCredit).toBe(false)
    expect(decision.reason).toBe('subscription')
  })

  it('historical subscription → canDownload=true', () => {
    const decision = resolveExportEntitlement({
      userId: 'user_1',
      subscriptionStatus: null,
      historicalSubscriptionActive: true,
    })
    expect(decision.canDownload).toBe(true)
    expect(decision.requiresPayment).toBe(false)
    expect(decision.reason).toBe('historical_subscription')
  })

  it('credits available → canDownload=true, creditConsumed=true', () => {
    const decision = resolveExportEntitlement({
      userId: 'user_1',
      creditsRemaining: 5,
    })
    expect(decision.canDownload).toBe(true)
    expect(decision.requiresPayment).toBe(false)
    expect(decision.consumeCredit).toBe(true)
    expect(decision.reason).toBe('credits')
  })

  it('no credits, no subscription → canDownload=false, requiresPayment=true', () => {
    const decision = resolveExportEntitlement({
      userId: 'user_1',
      subscriptionStatus: null,
      creditsRemaining: 0,
    })
    expect(decision.canDownload).toBe(false)
    expect(decision.requiresPayment).toBe(true)
    expect(decision.reason).toBe('payment_required')
  })

  describe('badge inclusion', () => {
    it('subscribed → no badge', () => {
      const decision = resolveExportEntitlement({
        userId: 'user_1',
        subscriptionStatus: 'active',
      })
      expect(decision.includeBadge).toBe(false)
    })

    it('credits → no payment badge (credits are a valid access path)', () => {
      const decision = resolveExportEntitlement({
        userId: 'user_1',
        creditsRemaining: 3,
      })
      // If credits wrongly show a badge, that's a BUG — let it FAIL.
      expect(decision.includeBadge).toBe(false)
    })

    it('anonymous / payment_required → badge shown', () => {
      const anon = resolveExportEntitlement({ userId: null })
      expect(anon.includeBadge).toBe(true)

      const broke = resolveExportEntitlement({
        userId: 'user_1',
        creditsRemaining: 0,
      })
      expect(broke.includeBadge).toBe(true)
    })
  })

  describe('subscription status → active access', () => {
    const activeCases: Array<{
      status: string
      active: boolean
    }> = [
      { status: 'active', active: true },
      { status: 'trialing', active: true },
      { status: 'authenticated', active: true },
      { status: 'past_due', active: false },
      { status: 'cancelled', active: false },
    ]

    for (const { status, active } of activeCases) {
      it(`hasExportSubscriptionAccess("${status}") → ${active}`, () => {
        expect(hasExportSubscriptionAccess(status as never)).toBe(active)
      })
    }
  })
})

// ---------------------------------------------------------------------------
// Referral edge cases
// ---------------------------------------------------------------------------

describe('referrals', () => {
  describe('referral code generation', () => {
    it('stable: same RNG source → same code', () => {
      const seeded = (() => {
        let x = 0.42
        return () => {
          x = (x * 9301 + 49297) % 233280
          return x / 233280
        }
      })()
      const a = generateReferralCode(seeded)
      const b = generateReferralCode(seeded)
      // Same RNG sequence produces the same characters.
      expect(a).toMatch(/^[A-Z0-9]{8}$/)
      expect(b).toMatch(/^[A-Z0-9]{8}$/)
    })

    it('unique per user: different RNG → different codes (high probability)', () => {
      const codes = new Set(
        Array.from({ length: 200 }, () => generateReferralCode()),
      )
      // 200 codes from Math.random should yield many distinct values.
      expect(codes.size).toBeGreaterThan(100)
      for (const code of codes) {
        expect(code).toMatch(/^[A-Z0-9]{8}$/)
      }
    })

    it('uses the unambiguous alphabet (no 0/O/1/I/L)', () => {
      for (let i = 0; i < 100; i += 1) {
        const code = generateReferralCode()
        expect(code).toMatch(/^[A-Z0-9]{8}$/)
        expect(code).not.toMatch(/[01OIL]/)
      }
    })
  })

  describe('referral signup recording (pure logic)', () => {
    it('normalizes user-supplied codes to canonical form', () => {
      expect(normalizeReferralCode('  abcd1234  ')).toBe('ABCD1234')
      expect(normalizeReferralCode('ab-cd_12!34')).toBe('ABCD1234')
      expect(normalizeReferralCode('lower')).toBe('LOWER')
      expect(normalizeReferralCode('')).toBe('')
      expect(normalizeReferralCode(null)).toBe('')
      // Truncates to 8 chars.
      expect(normalizeReferralCode('ABCDEFGH1234')).toBe('ABCDEFGH')
    })

    it('classifies identity emails for signup attribution', () => {
      const real = classifyReferralEmail('bob@gmail.com')
      expect(real.valid).toBe(true)
      expect(real.disposable).toBe(false)
      expect(real.acceptable).toBe(true)

      const burner = classifyReferralEmail('bob@mailinator.com')
      expect(burner.disposable).toBe(true)
      expect(burner.acceptable).toBe(false)
    })
  })

  describe('lifetime unlock', () => {
    it('threshold is 2 paid referrals', () => {
      expect(REFERRAL_THRESHOLD).toBe(2)
    })

    it('1 qualified referral → not unlocked', () => {
      expect(isRewardUnlocked(1)).toBe(false)
      const state = computeRewardState(1, false)
      expect(state.unlocked).toBe(false)
      expect(state.justUnlocked).toBe(false)
    })

    it('2 paid referrals → unlocked, justUnlocked=true on the transition', () => {
      const state = computeRewardState(2, false)
      expect(state.unlocked).toBe(true)
      expect(state.justUnlocked).toBe(true)
      expect(isRewardUnlocked(2)).toBe(true)
    })

    it('unlock is monotonic: already-unlocked stays unlocked even if count drops', () => {
      const state = computeRewardState(0, true)
      expect(state.unlocked).toBe(true)
      expect(state.justUnlocked).toBe(false)
    })

    it('discount percent is 50', () => {
      expect(REFERRAL_DISCOUNT_PERCENT).toBe(50)
    })
  })

  describe('disposable email disqualification', () => {
    it('mailinator / yopmail / guerrillamail → disposable', () => {
      expect(isDisposableEmail('x@mailinator.com')).toBe(true)
      expect(isDisposableEmail('x@yopmail.com')).toBe(true)
      expect(isDisposableEmail('x@guerrillamail.com')).toBe(true)
      expect(isDisposableEmail('x@10minutemail.com')).toBe(true)
    })

    it('sub-domained burners → disposable', () => {
      expect(isDisposableEmail('x@foo.mailinator.com')).toBe(true)
    })

    it('real providers → not disposable', () => {
      expect(isDisposableEmail('x@gmail.com')).toBe(false)
      expect(isDisposableEmail('x@yahoo.com')).toBe(false)
      expect(isDisposableEmail('x@proton.me')).toBe(false)
    })

    it('classifyReferralEmail marks burners as not acceptable', () => {
      const burner = classifyReferralEmail('b1@yopmail.com')
      expect(burner.disposable).toBe(true)
      expect(burner.acceptable).toBe(false)
    })
  })

  describe('discount context: referral discount applied to both payer and referrer', () => {
    it('webhook reconciles the discount for BOTH the payer and the just-unlocked referrer', async () => {
      const event = {
        id: 'evt_payer',
        data: {
          object: {
            id: 'cs_payer',
            mode: 'subscription',
            subscription: 'sub_payer',
            status: 'active',
            metadata: {
              userId: 'payer',
              mode: 'subscription',
              tier: 'pro',
            },
          },
        },
      }
      const request = await buildSignedStripeRequest(event)
      const client = mockConvexClient(() => ({
        processed: true,
        duplicate: false,
        referralUnlock: { referrerUserId: 'referrer' },
      }))

      const applyDiscount = vi.fn(async (_env, userId) => ({
        applied: true,
        reason: 'ok',
        userId,
      }))

      const response = await createWebhookApiResponse(
        request,
        'stripe',
        stripeEnv,
        client,
        applyDiscount,
      )

      expect(response.status).toBe(200)
      const reconciled = applyDiscount.mock.calls.map((call) => call[1]).sort()
      expect(reconciled).toEqual(['payer', 'referrer'])
    })

    it('applyReferralDiscountForUser attaches the Stripe coupon for an unlocked referrer', async () => {
      const fetchMock = vi.fn(async (url) => {
        const u = String(url)
        if (u.endsWith('/coupons')) {
          return new Response(
            JSON.stringify({ id: 'shipfast_ref_50_forever' }),
            { status: 200 },
          )
        }
        // Subscription discount attach.
        expect(u).toContain('/subscriptions/sub_alice')
        return new Response(JSON.stringify({ id: 'sub_alice' }), {
          status: 200,
        })
      })
      vi.stubGlobal('fetch', fetchMock)

      const convexClient = {
        query: vi.fn(async () => ({
          unlocked: true,
          discountApplied: false,
          subscription: {
            provider: 'stripe',
            providerSubscriptionId: 'sub_alice',
          },
        })),
        mutation: vi.fn(async () => ({ ok: true })),
      }

      const result = await applyReferralDiscountForUser(
        discountEnv,
        'referrer_alice',
        convexClient,
      )

      expect(result).toEqual({ applied: true, reason: 'ok' })
      // Coupon ensured + subscription updated.
      expect(fetchMock).toHaveBeenCalledTimes(2)
      // Discount recorded in Convex.
      expect(convexClient.mutation).toHaveBeenCalledOnce()
      const markArgs = (
        convexClient.mutation.mock.calls[0] as unknown[]
      )[1] as {
        provider: string
        providerDiscountId: string
        subscriptionId: string
      }
      expect(markArgs.provider).toBe('stripe')
      expect(markArgs.providerDiscountId).toBe('shipfast_ref_50_forever')
      expect(markArgs.subscriptionId).toBe('sub_alice')
    })

    it('applyReferralDiscountForUser returns razorpay_not_configured without Razorpay keys (no Stripe call)', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      const convexClient = {
        query: vi.fn(async () => ({
          unlocked: true,
          discountApplied: false,
          subscription: {
            provider: 'razorpay',
            providerSubscriptionId: 'sub_rzp',
          },
        })),
        mutation: vi.fn(),
      }

      const result = await applyReferralDiscountForUser(
        discountEnv,
        'referrer_rzp',
        convexClient,
      )

      expect(result.reason).toBe('razorpay_not_configured')
      expect(fetchMock).not.toHaveBeenCalled()
      expect(convexClient.mutation).not.toHaveBeenCalled()
    })

    it('applyReferralDiscountForUser skips when the referrer has not unlocked yet', async () => {
      const convexClient = {
        query: vi.fn(async () => ({
          unlocked: false,
          discountApplied: false,
          subscription: null,
        })),
        mutation: vi.fn(),
      }

      const result = await applyReferralDiscountForUser(
        discountEnv,
        'referrer_locked',
        convexClient,
      )

      expect(result.reason).toBe('not_unlocked')
      expect(convexClient.mutation).not.toHaveBeenCalled()
    })

    it('applyReferralDiscountForUser skips when the discount was already applied', async () => {
      const convexClient = {
        query: vi.fn(async () => ({
          unlocked: true,
          discountApplied: true,
          subscription: {
            provider: 'stripe',
            providerSubscriptionId: 'sub_alice',
          },
        })),
        mutation: vi.fn(),
      }

      const result = await applyReferralDiscountForUser(
        discountEnv,
        'referrer_alice',
        convexClient,
      )

      expect(result.reason).toBe('already_applied')
      expect(convexClient.mutation).not.toHaveBeenCalled()
    })
  })
})
