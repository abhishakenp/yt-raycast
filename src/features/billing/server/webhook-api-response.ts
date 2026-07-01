import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { applyReferralDiscountForUser } from '@/features/referrals/server/referral-discount'

type WebhookConvexClient = Pick<ConvexHttpClient, 'mutation'>
type ApplyReferralDiscount = (
  env: NodeJS.ProcessEnv,
  userId: string,
) => Promise<{ applied: boolean; reason: string }>
type Provider = 'stripe' | 'razorpay'
type BillingWebhookEnv = NodeJS.ProcessEnv
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
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i)
  }
  return diff === 0
}

const verifyStripeSignature = async (
  rawBody: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> => {
  const parts = Object.fromEntries(
    signatureHeader
      .split(',')
      .map((part) => part.split('='))
      .filter(([key, value]) => key && value),
  )
  if (!parts.t || !parts.v1) return false
  const expected = await hmacSha256(secret, `${parts.t}.${rawBody}`)
  return timingSafeEqual(expected, parts.v1)
}

const verifyRazorpaySignature = async (
  rawBody: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> => {
  const expected = await hmacSha256(secret, rawBody)
  return timingSafeEqual(expected, signatureHeader)
}

const normalizeStripeStatus = (status: unknown): BillingStatus => {
  if (status === 'trialing') return 'trialing'
  if (status === 'past_due') return 'past_due'
  if (status === 'canceled' || status === 'cancelled') return 'cancelled'
  return 'active'
}

const normalizeRazorpayStatus = (status: unknown): BillingStatus => {
  if (status === 'authenticated') return 'authenticated'
  if (status === 'cancelled' || status === 'canceled') return 'cancelled'
  if (status === 'past_due') return 'past_due'
  return 'active'
}

const creditsForPack = (packId: string): number =>
  packId === '10_credits' ? 10 : packId === '3_credits' ? 3 : 0

const stripePayloadToMutation = (event: any) => {
  const object = event?.data?.object ?? {}
  const metadata = object.metadata ?? {}
  const userId = metadata.userId ?? object.client_reference_id
  const mode =
    metadata.mode ?? (object.mode === 'subscription' ? 'subscription' : '')
  const packId = String(metadata.packId ?? '')

  if (!userId) return null
  if (mode === 'credit_pack') {
    const credits = creditsForPack(packId)
    return credits > 0
      ? {
          provider: 'stripe' as const,
          idempotencyKey: String(event.id || object.id),
          userId: String(userId),
          credits,
        }
      : null
  }

  const subscriptionId = String(object.subscription ?? object.id ?? '')
  return {
    provider: 'stripe' as const,
    idempotencyKey: String(event.id || object.id),
    userId: String(userId),
    subscription: {
      status: normalizeStripeStatus(object.status),
      planId: String(metadata.tier ?? object.plan?.id ?? 'pro'),
      providerSubscriptionId: subscriptionId || undefined,
      providerCheckoutId: String(object.id ?? '') || undefined,
    },
  }
}

const razorpayPayloadToMutation = (event: any) => {
  const subscription = event?.payload?.subscription?.entity
  if (subscription) {
    const notes = subscription.notes ?? {}
    const userId = notes.userId ?? notes.user_id
    if (!userId) return null
    return {
      provider: 'razorpay' as const,
      idempotencyKey:
        String(event.event || 'subscription') + ':' + String(subscription.id),
      userId: String(userId),
      subscription: {
        status: normalizeRazorpayStatus(subscription.status),
        planId: String(subscription.plan_id ?? notes.tier ?? 'pro'),
        providerSubscriptionId: String(subscription.id),
      },
    }
  }

  const order = event?.payload?.order?.entity
  const notes = order?.notes ?? {}
  const userId = notes.userId ?? notes.user_id
  const packId = String(notes.packId ?? notes.pack_id ?? '')
  const credits = creditsForPack(packId)
  return userId && credits > 0
    ? {
        provider: 'razorpay' as const,
        idempotencyKey: String(event.event || 'order') + ':' + String(order.id),
        userId: String(userId),
        credits,
      }
    : null
}

export const createWebhookApiResponse = async (
  request: Request,
  provider: Provider,
  env: BillingWebhookEnv = process.env,
  clientOverride?: WebhookConvexClient,
  applyDiscount: ApplyReferralDiscount = applyReferralDiscountForUser,
): Promise<Response> => {
  const rawBody = await request.text()
  const providerSecret =
    provider === 'stripe'
      ? env.STRIPE_WEBHOOK_SECRET
      : env.RAZORPAY_WEBHOOK_SECRET
  const mutationSecret = env.BILLING_WEBHOOK_MUTATION_SECRET
  if (!providerSecret || !mutationSecret) {
    return json(
      { error: `${provider} webhook is not configured.` },
      { status: 503 },
    )
  }

  const signature =
    provider === 'stripe'
      ? (request.headers.get('stripe-signature') ?? '')
      : (request.headers.get('x-razorpay-signature') ?? '')
  const valid =
    provider === 'stripe'
      ? await verifyStripeSignature(rawBody, signature, providerSecret)
      : await verifyRazorpaySignature(rawBody, signature, providerSecret)
  if (!valid) {
    return json({ error: 'Invalid webhook signature.' }, { status: 400 })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return json({ error: 'Invalid webhook body.' }, { status: 400 })
  }
  const mutationPayload =
    provider === 'stripe'
      ? stripePayloadToMutation(event)
      : razorpayPayloadToMutation(event)
  if (mutationPayload === null) return json({ received: true, ignored: true })

  const client = clientOverride ?? createRuntimeConvexHttpClient()
  const result = (await client.mutation(api.billing.applyBillingWebhook, {
    secret: mutationSecret,
    ...mutationPayload,
  })) as { referralUnlock?: { referrerUserId: string } | null }

  // Apply the lifetime referral discount to anyone whose eligibility may have
  // changed: the referrer who just hit the threshold, and the payer themselves
  // (they may be an already-unlocked referrer who just (re)subscribed). Both are
  // best-effort and never block the webhook response.
  const usersToReconcile = new Set<string>([mutationPayload.userId])
  if (result?.referralUnlock?.referrerUserId) {
    usersToReconcile.add(result.referralUnlock.referrerUserId)
  }
  await Promise.all(
    [...usersToReconcile].map((userId) =>
      applyDiscount(env, userId).catch(() => ({
        applied: false,
        reason: 'unhandled',
      })),
    ),
  )

  return json({ received: true })
}
