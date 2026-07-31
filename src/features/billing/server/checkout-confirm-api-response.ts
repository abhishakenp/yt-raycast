import { ConvexHttpClient } from 'convex/browser'

import { api, internal } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { checkRateLimit, checkoutConfirmHits } from '@/lib/rate-limit'
import {
  getClientIp,
  hashClientIp,
} from '@/features/session/server/session-create-response'

type CheckoutConfirmConvexClient = Pick<
  ConvexHttpClient,
  'query' | 'mutation' | 'setAuth'
>

type CheckoutConfirmEnv = NodeJS.ProcessEnv

type CheckoutConfirmBody = {
  subscriptionId?: unknown
  paymentId?: unknown
  signature?: unknown
}

type BillingStatus =
  | 'active'
  | 'trialing'
  | 'authenticated'
  | 'past_due'
  | 'cancelled'

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const getBearerToken = (request: Request): string | null => {
  const match = (request.headers.get('authorization') ?? '').match(
    /^Bearer\s+(.+)$/i,
  )
  return match?.[1]?.trim() || null
}

const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const toHex = (bytes: ArrayBuffer): string =>
  Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

const hmacSha256 = async (secret: string, payload: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return toHex(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)),
  )
}

const timingSafeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) return false
  let diff = 0
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return diff === 0
}

const normalizeRazorpayStatus = (status: unknown): BillingStatus => {
  if (status === 'active') return 'active'
  if (status === 'trialing') return 'trialing'
  if (status === 'authenticated') return 'authenticated'
  if (status === 'past_due') return 'past_due'
  if (status === 'cancelled' || status === 'canceled') return 'cancelled'
  // Deny-by-default: unknown statuses (halted, pending, etc.) must NOT
  // grant active access.
  return 'cancelled'
}

export const createCheckoutConfirmApiResponse = async (
  request: Request,
  env: CheckoutConfirmEnv = process.env,
  clientOverride?: CheckoutConfirmConvexClient,
): Promise<Response> => {
  // Rate limit: max 5 checkout confirmations per 10 minutes per IP.
  const ipHash = hashClientIp(getClientIp(request))
  if (!checkRateLimit(ipHash, checkoutConfirmHits, 5, 10 * 60 * 1000)) {
    return json(
      { error: 'Too many checkout attempts. Please wait a few minutes.' },
      { status: 429 },
    )
  }

  const token = getBearerToken(request)
  if (token === null) {
    return json({ error: 'Sign in before checkout.' }, { status: 401 })
  }

  let body: CheckoutConfirmBody = {}
  try {
    body = (await request.json()) as CheckoutConfirmBody
  } catch {
    return json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const subscriptionId = normalizeString(body.subscriptionId)
  const paymentId = normalizeString(body.paymentId)
  const signature = normalizeString(body.signature)
  if (!subscriptionId || !paymentId || !signature) {
    return json({ error: 'Invalid Razorpay confirmation.' }, { status: 400 })
  }

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json(
      { error: 'Razorpay confirmation is not configured.' },
      { status: 503 },
    )
  }

  const expectedSignature = await hmacSha256(
    env.RAZORPAY_KEY_SECRET,
    `${paymentId}|${subscriptionId}`,
  )
  if (!timingSafeEqual(expectedSignature, signature)) {
    return json({ error: 'Invalid Razorpay signature.' }, { status: 400 })
  }

  const client = clientOverride ?? createRuntimeConvexHttpClient()
  client.setAuth(token)
  let overview: { userId?: string }
  try {
    overview = (await client.query(api.billing.getBillingOverview, {})) as {
      userId?: string
    }
  } catch {
    return json({ error: 'Sign in before checkout.' }, { status: 401 })
  }
  if (!overview.userId) {
    return json({ error: 'Sign in before checkout.' }, { status: 401 })
  }

  let subscription: {
    id?: string
    status?: string
    plan_id?: string
    notes?: { userId?: string; user_id?: string }
  }
  try {
    const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)
    const response = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      },
    )
    subscription = (await response.json()) as typeof subscription
    if (!response.ok || subscription.id !== subscriptionId) {
      return json(
        { error: 'Razorpay subscription lookup failed.' },
        {
          status: 502,
        },
      )
    }
  } catch {
    return json(
      { error: 'Razorpay subscription lookup failed.' },
      {
        status: 502,
      },
    )
  }

  const subscriptionUserId =
    subscription.notes?.userId ?? subscription.notes?.user_id
  if (subscriptionUserId !== overview.userId) {
    return json(
      { error: 'Razorpay subscription owner mismatch.' },
      {
        status: 403,
      },
    )
  }

  const status = normalizeRazorpayStatus(subscription.status)
  const planId = normalizeString(subscription.plan_id) || 'pro'
  try {
    await client.mutation(internal.billing.confirmCheckoutSubscription, {
      userId: overview.userId,
      provider: 'razorpay',
      status,
      planId,
      providerSubscriptionId: subscriptionId,
      providerCheckoutId: paymentId,
    })
  } catch {
    return json({ error: 'Billing confirmation failed.' }, { status: 502 })
  }

  return json({
    provider: 'razorpay',
    subscription: {
      active:
        status === 'active' ||
        status === 'trialing' ||
        status === 'authenticated',
      status,
      planId,
      providerSubscriptionId: subscriptionId,
    },
  })
}
