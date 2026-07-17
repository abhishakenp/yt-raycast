import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import {
  isGatewayConfigured,
  resolvePaymentCurrency,
  resolvePaymentGateway,
} from '@/billing/payment-routing.js'
import { ensureStripeReferralCoupon } from '@/features/referrals/server/referral-discount'

type CheckoutConvexClient = Pick<ConvexHttpClient, 'query' | 'setAuth'>

type CheckoutBody = {
  mode?: unknown
  tier?: unknown
  packId?: unknown
  gateway?: unknown
  countryCode?: unknown
  sessionId?: unknown
}

type CheckoutEnv = NodeJS.ProcessEnv

const creditPacks = {
  '3_credits': {
    stripePriceEnv: 'STRIPE_CREDITS_3_PRICE_ID',
    razorpayAmountEnv: 'RAZORPAY_CREDITS_3_PAISE',
    credits: 3,
  },
  '10_credits': {
    stripePriceEnv: 'STRIPE_CREDITS_10_PRICE_ID',
    razorpayAmountEnv: 'RAZORPAY_CREDITS_10_PAISE',
    credits: 10,
  },
} as const

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

function getBearerToken(request: Request): string | null {
  const match = (request.headers.get('authorization') ?? '').match(
    /^Bearer\s+(.+)$/i,
  )
  return match?.[1]?.trim() || null
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getOrigin(request: Request): string {
  const url = new URL(request.url)
  return `${url.protocol}//${url.host}`
}

function getCheckoutUrls(request: Request, sessionId: string) {
  const origin = getOrigin(request)
  const sessionPath = sessionId
    ? `/generate/${encodeURIComponent(sessionId)}`
    : '/'
  return {
    successUrl: `${origin}${sessionPath}?checkout=success`,
    cancelUrl: `${origin}${sessionPath}?checkout=cancelled`,
  }
}

function formBody(entries: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(entries)) {
    if (value) params.set(key, value)
  }
  return params
}

async function fetchStripeCheckout(
  env: CheckoutEnv,
  request: Request,
  body: CheckoutBody,
  userId: string,
  referralCouponId: string | null,
) {
  const mode = normalizeString(body.mode)
  const tier = normalizeString(body.tier) || 'pro'
  const packId = normalizeString(body.packId)
  const sessionId = normalizeString(body.sessionId)
  const { successUrl, cancelUrl } = getCheckoutUrls(request, sessionId)
  const priceId =
    mode === 'credit_pack'
      ? env[creditPacks[packId as keyof typeof creditPacks]?.stripePriceEnv]
      : tier === 'early_adopter'
        ? env.STRIPE_EARLY_ADOPTER_PRICE_ID
        : env.STRIPE_PRO_PRICE_ID

  if (!env.STRIPE_SECRET_KEY || !priceId) {
    return json(
      { error: 'Stripe checkout is not configured.' },
      { status: 503 },
    )
  }

  // Apply the lifetime referral discount only to recurring subscriptions.
  const checkoutFields: Record<string, string> = {
    mode: mode === 'credit_pack' ? 'payment' : 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'metadata[userId]': userId,
    'metadata[mode]': mode,
    'metadata[tier]': tier,
    'metadata[packId]': packId,
  }
  if (mode !== 'credit_pack') {
    // Stripe rejects subscription_data in payment mode.
    checkoutFields['subscription_data[metadata][userId]'] = userId
    checkoutFields['subscription_data[metadata][tier]'] = tier
    if (env.DUB_PARTNERS_ENABLED?.trim().toLowerCase() === 'true') {
      checkoutFields['metadata[dubCustomerExternalId]'] = userId
    }
  }
  if (mode === 'subscription' && referralCouponId) {
    checkoutFields['discounts[0][coupon]'] = referralCouponId
  }

  let response: Response
  try {
    response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody(checkoutFields),
    })
  } catch {
    return json({ error: 'Stripe checkout failed.' }, { status: 502 })
  }
  let data: {
    id?: string
    url?: string
    error?: { message?: string }
  }
  let parseFailed = false
  try {
    data = (await response.json()) as typeof data
  } catch {
    data = {}
    parseFailed = true
  }

  if (!response.ok) {
    return json(
      { error: data.error?.message ?? 'Stripe checkout failed.' },
      { status: response.status },
    )
  }

  if (parseFailed) {
    return json({ error: 'Stripe checkout failed.' }, { status: 502 })
  }

  if (!data.id || !data.url) {
    return json({ error: 'Stripe checkout failed.' }, { status: 502 })
  }

  return json({
    provider: 'stripe',
    checkoutSessionId: data.id,
    url: data.url,
  })
}

async function fetchRazorpayCheckout(
  env: CheckoutEnv,
  body: CheckoutBody,
  userId: string,
  referralOfferId: string | null,
) {
  const mode = normalizeString(body.mode)
  const tier = normalizeString(body.tier) || 'pro'
  const packId = normalizeString(body.packId) as keyof typeof creditPacks

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json(
      { error: 'Razorpay checkout is not configured.' },
      { status: 503 },
    )
  }

  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)

  if (mode === 'subscription') {
    const planId =
      tier === 'early_adopter'
        ? env.RAZORPAY_EARLY_ADOPTER_PLAN_ID
        : env.RAZORPAY_PRO_PLAN_ID
    if (!planId) {
      return json(
        { error: 'Razorpay subscription plan is not configured.' },
        { status: 503 },
      )
    }

    let response: Response
    try {
      response = await fetch('https://api.razorpay.com/v1/subscriptions', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          total_count: 120,
          customer_notify: 1,
          // Lifetime referral reward → apply the pre-configured Razorpay offer.
          ...(referralOfferId ? { offer_id: referralOfferId } : {}),
          notes: { userId, tier },
        }),
      })
    } catch {
      return json({ error: 'Razorpay subscription failed.' }, { status: 502 })
    }
    let data: {
      id?: string
      error?: { description?: string }
    }
    let parseFailed = false
    try {
      data = (await response.json()) as typeof data
    } catch {
      data = {}
      parseFailed = true
    }
    if (!response.ok) {
      return json(
        { error: data.error?.description ?? 'Razorpay subscription failed.' },
        { status: response.status },
      )
    }
    if (parseFailed) {
      return json({ error: 'Razorpay subscription failed.' }, { status: 502 })
    }
    if (!data.id) {
      return json({ error: 'Razorpay subscription failed.' }, { status: 502 })
    }
    return json({
      provider: 'razorpay',
      keyId: env.RAZORPAY_KEY_ID,
      subscriptionId: data.id,
      planId,
    })
  }

  const pack = creditPacks[packId]
  const amount = pack
    ? Number.parseInt(env[pack.razorpayAmountEnv] ?? '0', 10)
    : 0
  if (!pack || !amount) {
    return json(
      { error: 'Invalid or unconfigured credit pack.' },
      { status: 400 },
    )
  }

  let response: Response
  try {
    response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        notes: { userId, packId, credits: pack.credits },
      }),
    })
  } catch {
    return json({ error: 'Razorpay order failed.' }, { status: 502 })
  }
  let data: {
    id?: string
    amount?: number
    currency?: string
    error?: { description?: string }
  }
  let parseFailed = false
  try {
    data = (await response.json()) as typeof data
  } catch {
    data = {}
    parseFailed = true
  }
  if (!response.ok) {
    return json(
      { error: data.error?.description ?? 'Razorpay order failed.' },
      { status: response.status },
    )
  }
  if (parseFailed) {
    return json({ error: 'Razorpay order failed.' }, { status: 502 })
  }
  if (!data.id || data.amount === undefined) {
    return json({ error: 'Razorpay order failed.' }, { status: 502 })
  }
  return json({
    provider: 'razorpay',
    keyId: env.RAZORPAY_KEY_ID,
    orderId: data.id,
    amount: data.amount,
    currency: data.currency ?? 'INR',
  })
}

export async function createCheckoutApiResponse(
  request: Request,
  env: CheckoutEnv = process.env,
  clientOverride?: CheckoutConvexClient,
): Promise<Response> {
  const token = getBearerToken(request)
  if (token === null) {
    return json({ error: 'Sign in before checkout.' }, { status: 401 })
  }

  let body: CheckoutBody = {}
  try {
    body = (await request.json()) as CheckoutBody
  } catch {
    return json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const mode = normalizeString(body.mode)
  if (mode !== 'subscription' && mode !== 'credit_pack') {
    return json({ error: 'Invalid checkout mode.' }, { status: 400 })
  }

  const client = clientOverride ?? createRuntimeConvexHttpClient()
  client.setAuth(token)
  let overview: { userId?: string }
  try {
    overview = (await client.query(api.billing.getBillingOverview, {})) as {
      userId?: string
    }
  } catch {
    return json({ error: 'Unable to start checkout.' }, { status: 503 })
  }
  if (!overview.userId) {
    return json({ error: 'Sign in before checkout.' }, { status: 401 })
  }

  const requestedGateway = normalizeString(body.gateway)
  const countryCode = normalizeString(body.countryCode)
  const gateway =
    requestedGateway === 'stripe' || requestedGateway === 'razorpay'
      ? requestedGateway
      : resolvePaymentGateway(countryCode)
  if (!isGatewayConfigured(gateway, env)) {
    return json(
      {
        error: `${gateway} checkout is not configured.`,
        gateway,
        currency: resolvePaymentCurrency(gateway),
      },
      { status: 503 },
    )
  }

  // Resolve the lifetime referral reward for unlocked referrers starting a new
  // subscription. Best-effort: a lookup failure must not block checkout.
  let referralUnlocked = false
  const secret = env.BILLING_WEBHOOK_MUTATION_SECRET
  if (mode === 'subscription' && secret) {
    try {
      const eligibility = (await client.query(
        api.referrals.isDiscountUnlockedForUser,
        { secret, userId: overview.userId },
      )) as { unlocked?: boolean }
      referralUnlocked = Boolean(eligibility?.unlocked)
    } catch {
      referralUnlocked = false
    }
  }

  if (gateway === 'razorpay') {
    // Razorpay offers must be pre-created in the dashboard and referenced by id.
    const referralOfferId = referralUnlocked
      ? (env.RAZORPAY_REFERRAL_OFFER_ID ?? '').trim() || null
      : null
    return await fetchRazorpayCheckout(
      env,
      body,
      overview.userId,
      referralOfferId,
    )
  }

  const referralCouponId = referralUnlocked
    ? await ensureStripeReferralCoupon(env)
    : null

  return await fetchStripeCheckout(
    env,
    request,
    body,
    overview.userId,
    referralCouponId,
  )
}
