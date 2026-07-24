import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import {
  isGatewayConfigured,
  resolvePaymentCurrency,
  resolvePaymentGateway,
} from '@/billing/payment-routing.js'

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
    razorpayAmountEnv: 'RAZORPAY_CREDITS_3_PAISE',
    credits: 3,
  },
  '10_credits': {
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

function isAuthFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /UNAUTHENTICATED|Unauthenticated|Unauthorized|No auth provider|auth/i.test(
    message,
  )
}

const fetchRazorpayCheckout = async (
  env: CheckoutEnv,
  body: CheckoutBody,
  userId: string,
  referralOfferId: string | null,
) => {
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
          // Lifetime referral reward: apply the pre-configured Razorpay offer.
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
  gatewayOverride?: unknown,
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

  const requestedGateway =
    normalizeString(gatewayOverride) || normalizeString(body.gateway)
  if (requestedGateway !== '' && requestedGateway !== 'razorpay') {
    return json({ error: 'Invalid payment gateway.' }, { status: 400 })
  }

  const client = clientOverride ?? createRuntimeConvexHttpClient()
  client.setAuth(token)
  let overview: { userId?: string }
  try {
    overview = (await client.query(api.billing.getBillingOverview, {})) as {
      userId?: string
    }
  } catch (error) {
    if (isAuthFailure(error)) {
      return json({ error: 'Sign in before checkout.' }, { status: 401 })
    }
    return json({ error: 'Unable to start checkout.' }, { status: 503 })
  }
  if (!overview.userId) {
    return json({ error: 'Sign in before checkout.' }, { status: 401 })
  }

  const gateway = resolvePaymentGateway()
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
