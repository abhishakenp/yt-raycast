import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type ReferralDiscountEnv = NodeJS.ProcessEnv
type DiscountConvexClient = Pick<ConvexHttpClient, 'query' | 'mutation'>

/** Stable id we reuse so we never pile up duplicate Stripe coupons. */
const STRIPE_REFERRAL_COUPON_ID = 'shipfast_ref_50_forever'
const REFERRAL_DISCOUNT_PERCENT = 50

function formBody(entries: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(entries)) {
    if (value) params.set(key, value)
  }
  return params
}

async function stripeRequest(
  env: ReferralDiscountEnv,
  path: string,
  body: URLSearchParams,
) {
  return await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
}

async function razorpayRequest(
  env: ReferralDiscountEnv,
  method: 'GET' | 'POST',
  path: string,
  body?: URLSearchParams,
) {
  const auth = Buffer.from(
    `${env.RAZORPAY_KEY_ID ?? ''}:${env.RAZORPAY_KEY_SECRET ?? ''}`,
  ).toString('base64')
  return await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
}

/**
 * Resolve the Stripe coupon id for the lifetime referral discount.
 * Prefers an explicit env override; otherwise lazily creates a single reusable
 * `50% off, duration: forever` coupon and reuses it on subsequent calls.
 */
export async function ensureStripeReferralCoupon(
  env: ReferralDiscountEnv,
): Promise<string | null> {
  if (!env.STRIPE_SECRET_KEY) return null
  const override = (env.STRIPE_REFERRAL_COUPON_ID ?? '').trim()
  if (override) return override

  const response = await stripeRequest(
    env,
    '/coupons',
    formBody({
      id: STRIPE_REFERRAL_COUPON_ID,
      percent_off: String(REFERRAL_DISCOUNT_PERCENT),
      duration: 'forever',
      name: 'Referral reward — 50% for life',
    }),
  )
  if (response.ok) return STRIPE_REFERRAL_COUPON_ID

  // Already created on a previous run → reuse it.
  const data = (await response.json().catch(() => ({}))) as {
    error?: { code?: string }
  }
  if (data.error?.code === 'resource_already_exists') {
    return STRIPE_REFERRAL_COUPON_ID
  }
  return null
}

/** Attach the lifetime coupon to an existing Stripe subscription. */
export async function applyStripeReferralDiscountToSubscription(
  env: ReferralDiscountEnv,
  subscriptionId: string,
  couponId: string,
): Promise<boolean> {
  const response = await stripeRequest(
    env,
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    formBody({ 'discounts[0][coupon]': couponId }),
  )
  return response.ok
}

type RazorpayPayment = {
  id: string
  amount: number
  status: string
  amount_refunded?: number
}

/**
 * Fetch the most recent captured payment for a Razorpay subscription.
 * Returns null if no captured payment is found or the API call fails.
 */
async function fetchLatestRazorpayPayment(
  env: ReferralDiscountEnv,
  subscriptionId: string,
): Promise<RazorpayPayment | null> {
  const response = await razorpayRequest(
    env,
    'GET',
    `/subscriptions/${encodeURIComponent(subscriptionId)}/payments?count=1`,
  )
  if (!response.ok) return null
  const data = (await response.json().catch(() => ({
    items: [],
  }))) as { items?: RazorpayPayment[] }
  const captured = (data.items ?? []).find((p) => p.status === 'captured')
  return captured ?? null
}

/**
 * Issue a partial refund for 50% of the payment amount on Razorpay.
 * Skips payments that have already been refunded for the discount amount.
 */
async function refundRazorpayReferralDiscount(
  env: ReferralDiscountEnv,
  payment: RazorpayPayment,
): Promise<boolean> {
  const refundAmount = Math.floor(
    (payment.amount * REFERRAL_DISCOUNT_PERCENT) / 100,
  )
  const alreadyRefunded = payment.amount_refunded ?? 0
  if (alreadyRefunded >= refundAmount) return false

  const response = await razorpayRequest(
    env,
    'POST',
    `/payments/${encodeURIComponent(payment.id)}/refund`,
    formBody({ amount: String(refundAmount) }),
  )
  return response.ok
}

/**
 * Best-effort: if `userId` has unlocked the referral reward and has an active
 * subscription that has not yet received the discount, attach it at the provider
 * and record it. NEVER throws — discount application must not break payment
 * processing; failures are returned for logging and retried on the next event.
 *
 * Provider behaviour:
 * - Stripe: attaches the `forever` coupon to the subscription once → discount
 *   applies automatically on all future invoices.
 * - Razorpay: offers can't be attached to existing subscriptions, so on each
 *   call we issue a 50% partial refund on the most recent captured payment.
 *   This runs on every renewal webhook, applying the discount from each billing
 *   cycle. `markReferralDiscountApplied` is NOT called for Razorpay so the
 *   refund repeats on every renewal for life.
 */
export async function applyReferralDiscountForUser(
  env: ReferralDiscountEnv,
  userId: string,
  clientOverride?: DiscountConvexClient,
): Promise<{ applied: boolean; reason: string }> {
  const secret = env.BILLING_WEBHOOK_MUTATION_SECRET
  if (!secret) return { applied: false, reason: 'not_configured' }

  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    const context = (await client.query(
      api.referrals.getDiscountApplicationContext,
      { secret, userId },
    )) as {
      unlocked: boolean
      discountApplied: boolean
      subscription: {
        provider: 'stripe' | 'razorpay'
        providerSubscriptionId: string | null
      } | null
    }

    if (!context.unlocked) return { applied: false, reason: 'not_unlocked' }
    if (
      context.subscription === null ||
      !context.subscription.providerSubscriptionId
    )
      return { applied: false, reason: 'no_active_subscription' }

    // ── Stripe: attach coupon once, mark as applied ──────────────────────
    if (context.subscription.provider === 'stripe') {
      if (context.discountApplied)
        return { applied: false, reason: 'already_applied' }

      const couponId = await ensureStripeReferralCoupon(env)
      if (!couponId) return { applied: false, reason: 'coupon_unavailable' }

      const ok = await applyStripeReferralDiscountToSubscription(
        env,
        context.subscription.providerSubscriptionId,
        couponId,
      )
      if (!ok) return { applied: false, reason: 'provider_rejected' }

      await client.mutation(api.referrals.markReferralDiscountApplied, {
        secret,
        userId,
        provider: 'stripe',
        providerDiscountId: couponId,
        subscriptionId: context.subscription.providerSubscriptionId,
      })

      return { applied: true, reason: 'ok' }
    }

    // ── Razorpay: issue 50% refund on each renewal payment ───────────────
    // Don't check discountApplied — we want the refund on every billing cycle.
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET)
      return { applied: false, reason: 'razorpay_not_configured' }

    const payment = await fetchLatestRazorpayPayment(
      env,
      context.subscription.providerSubscriptionId,
    )
    if (payment === null)
      return { applied: false, reason: 'no_captured_payment' }

    const refunded = await refundRazorpayReferralDiscount(env, payment)
    return refunded
      ? { applied: true, reason: 'razorpay_refund_issued' }
      : { applied: false, reason: 'razorpay_already_refunded' }
  } catch (error) {
    return {
      applied: false,
      reason: error instanceof Error ? error.message : 'unknown_error',
    }
  }
}
