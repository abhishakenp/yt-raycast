import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { applyReferralDiscountForUser } from '@/features/referrals/server/referral-discount'
import {
  sendBusinessNotification,
  paymentDoneEvent,
} from '@/features/notifications/slack-business'

type WebhookConvexClient = Pick<ConvexHttpClient, 'mutation'>
type ApplyReferralDiscount = (
  env: NodeJS.ProcessEnv,
  userId: string,
) => Promise<{ applied: boolean; reason: string }>
type Provider = 'stripe' | 'razorpay'
type BillingWebhookEnv = NodeJS.ProcessEnv
type JsonRecord = Record<string, unknown>
type BillingStatus =
  | 'active'
  | 'trialing'
  | 'authenticated'
  | 'past_due'
  | 'cancelled'
type PartnerMutation = {
  idempotencyKey: string
  partnerEvent:
    | {
        amount: number
        currency: string
        invoiceId: string
        kind: 'sale'
        providerPaymentId: string
        providerSubscriptionId: string
      }
    | {
        amount: number
        currency: string
        invoiceId: string
        kind: 'refund'
        providerPaymentId: string
        remainingAmount: number
        refundId: string
      }
  provider: 'razorpay' | 'stripe'
}

const MAX_WEBHOOK_BODY_BYTES = 1_048_576

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

async function hmacSha256(secret: string, payload: string): Promise<string> {
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

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let diff = 0
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i)
  }
  return diff === 0
}

async function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = Object.fromEntries(
    signatureHeader
      .split(',')
      .map((part) => part.split('='))
      .filter(([key, value]) => key && value),
  )
  if (!parts.t || !parts.v1) return false

  // Replay attack protection: reject timestamps older than 5 minutes
  const timestamp = Number.parseInt(parts.t, 10)
  if (!Number.isFinite(timestamp)) return false
  const TOLERANCE_SECONDS = 300
  const nowSeconds = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSeconds - timestamp) > TOLERANCE_SECONDS) return false

  const expected = await hmacSha256(secret, `${parts.t}.${rawBody}`)
  return timingSafeEqual(expected, parts.v1)
}

async function verifyRazorpaySignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  const expected = await hmacSha256(secret, rawBody)
  return timingSafeEqual(expected, signatureHeader)
}

function normalizeStripeStatus(status: unknown): BillingStatus {
  if (status === 'trialing') return 'trialing'
  if (status === 'past_due') return 'past_due'
  if (status === 'canceled' || status === 'cancelled') return 'cancelled'
  return 'active'
}

function normalizeRazorpayStatus(status: unknown): BillingStatus {
  if (status === 'authenticated') return 'authenticated'
  if (status === 'cancelled' || status === 'canceled') return 'cancelled'
  if (status === 'past_due') return 'past_due'
  return 'active'
}

function creditsForPack(packId: string): number {
  return packId === '10_credits' ? 10 : packId === '3_credits' ? 3 : 0
}

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : null
}

async function readWebhookBody(request: Request): Promise<string | null> {
  const contentLength = Number(request.headers.get('content-length'))
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_WEBHOOK_BODY_BYTES
  ) {
    return null
  }

  const reader = request.body?.getReader()
  if (!reader) return ''

  const decoder = new TextDecoder()
  let byteLength = 0
  let body = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      byteLength += value.byteLength
      if (byteLength > MAX_WEBHOOK_BODY_BYTES) {
        await reader.cancel()
        return null
      }
      body += decoder.decode(value, { stream: true })
    }
    return body + decoder.decode()
  } finally {
    reader.releaseLock()
  }
}

function stripePayloadToMutation(event: unknown) {
  const eventRecord = asRecord(event)
  const data = asRecord(eventRecord?.data)
  const object = asRecord(data?.object)
  if (!eventRecord || !object) return null

  const metadata = asRecord(object.metadata) ?? {}
  const plan = asRecord(object.plan)
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
          idempotencyKey: String(eventRecord.id || object.id),
          userId: String(userId),
          credits,
        }
      : null
  }

  const subscriptionId = String(object.subscription ?? object.id ?? '')
  return {
    provider: 'stripe' as const,
    idempotencyKey: String(eventRecord.id || object.id),
    userId: String(userId),
    subscription: {
      status: normalizeStripeStatus(object.status),
      planId: String(metadata.tier ?? plan?.id ?? 'pro'),
      providerSubscriptionId: subscriptionId || undefined,
      providerCheckoutId: String(object.id ?? '') || undefined,
    },
  }
}

function razorpayPayloadToMutation(event: unknown) {
  const eventRecord = asRecord(event)
  const payload = asRecord(eventRecord?.payload)
  if (!eventRecord || !payload) return null

  const subscriptionContainer = asRecord(payload.subscription)
  const subscription = asRecord(subscriptionContainer?.entity)
  if (subscription) {
    const notes = asRecord(subscription.notes) ?? {}
    const userId = notes.userId ?? notes.user_id
    if (!userId) return null
    return {
      provider: 'razorpay' as const,
      idempotencyKey:
        String(eventRecord.event || 'subscription') +
        ':' +
        String(subscription.id),
      userId: String(userId),
      subscription: {
        status: normalizeRazorpayStatus(subscription.status),
        planId: String(subscription.plan_id ?? notes.tier ?? 'pro'),
        providerSubscriptionId: String(subscription.id),
      },
    }
  }

  const orderContainer = asRecord(payload.order)
  const order = asRecord(orderContainer?.entity)
  const notes = asRecord(order?.notes) ?? {}
  const userId = notes.userId ?? notes.user_id
  const packId = String(notes.packId ?? notes.pack_id ?? '')
  const credits = creditsForPack(packId)
  return userId && credits > 0
    ? {
        provider: 'razorpay' as const,
        idempotencyKey:
          String(eventRecord.event || 'order') + ':' + String(order?.id),
        userId: String(userId),
        credits,
      }
    : null
}

function positiveInteger(value: unknown): number | null {
  const amount = typeof value === 'number' ? value : Number(value)
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null
}

function currencyCode(value: unknown): string | null {
  const currency = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return /^[a-z]{3}$/.test(currency) ? currency : null
}

function razorpayPartnerPayloadToMutation(
  event: unknown,
): PartnerMutation | null {
  const eventRecord = asRecord(event)
  const payload = asRecord(eventRecord?.payload)
  const eventName =
    typeof eventRecord?.event === 'string' ? eventRecord.event : ''
  if (!payload) return null

  if (eventName === 'invoice.paid') {
    const invoice = asRecord(asRecord(payload.invoice)?.entity)
    const payment = asRecord(asRecord(payload.payment)?.entity)
    const invoiceId = String(invoice?.id ?? '')
    const subscriptionId = String(invoice?.subscription_id ?? '')
    const invoicePaymentId = String(invoice?.payment_id ?? '')
    const paymentId = String(payment?.id ?? invoicePaymentId)
    if (!invoiceId || !subscriptionId || !paymentId) return null
    if (invoicePaymentId && invoicePaymentId !== paymentId) return null
    if (payment?.invoice_id && String(payment.invoice_id) !== invoiceId) {
      return null
    }

    const invoiceAmount = positiveInteger(invoice?.amount_paid)
    const invoiceCurrency = currencyCode(invoice?.currency)
    const paymentAmount = positiveInteger(payment?.amount)
    const paymentCurrency = currencyCode(payment?.currency)
    const amount =
      invoiceAmount !== null && invoiceCurrency !== null
        ? invoiceAmount
        : paymentAmount
    const currency =
      invoiceAmount !== null && invoiceCurrency !== null
        ? invoiceCurrency
        : paymentCurrency
    if (amount === null || currency === null) return null

    return {
      idempotencyKey: `invoice.paid:${invoiceId}`,
      partnerEvent: {
        amount,
        currency,
        invoiceId,
        kind: 'sale',
        providerPaymentId: paymentId,
        providerSubscriptionId: subscriptionId,
      },
      provider: 'razorpay',
    }
  }

  if (eventName === 'refund.processed') {
    const payment = asRecord(asRecord(payload.payment)?.entity)
    const refund = asRecord(asRecord(payload.refund)?.entity)
    const paymentId = String(payment?.id ?? '')
    const refundPaymentId = String(refund?.payment_id ?? '')
    const invoiceId = String(payment?.invoice_id ?? '')
    const refundId = String(refund?.id ?? '')
    const amount = positiveInteger(refund?.amount)
    const paymentAmount = positiveInteger(payment?.amount)
    const amountRefunded = positiveInteger(payment?.amount_refunded)
    const currency =
      currencyCode(refund?.currency) ?? currencyCode(payment?.currency)
    if (
      !paymentId ||
      !refundPaymentId ||
      paymentId !== refundPaymentId ||
      !invoiceId ||
      !refundId ||
      amount === null ||
      paymentAmount === null ||
      amountRefunded === null ||
      amountRefunded > paymentAmount ||
      currency === null
    ) {
      return null
    }

    return {
      idempotencyKey: `refund.processed:${refundId}`,
      partnerEvent: {
        amount,
        currency,
        invoiceId,
        kind: 'refund',
        providerPaymentId: paymentId,
        remainingAmount: paymentAmount - amountRefunded,
        refundId,
      },
      provider: 'razorpay',
    }
  }

  return null
}

// Stripe equivalent of razorpayPartnerPayloadToMutation: a paid subscription
// invoice becomes a Dub "sale" so partner-referred Stripe customers earn
// commissions too. Attribution to a partner happens in the Convex mutation
// (via the subscription → user → dub_partner acquisition lookup).
function stripePartnerPayloadToMutation(
  event: unknown,
): PartnerMutation | null {
  const eventRecord = asRecord(event)
  const eventName =
    typeof eventRecord?.type === 'string' ? eventRecord.type : ''
  if (
    eventName !== 'invoice.paid' &&
    eventName !== 'invoice.payment_succeeded'
  ) {
    return null
  }
  const object = asRecord(asRecord(eventRecord?.data)?.object)
  if (!object) return null

  const invoiceId = String(object.id ?? '')
  const subscriptionId = String(object.subscription ?? '')
  const paymentId = String(object.payment_intent ?? object.charge ?? '')
  const amount = positiveInteger(object.amount_paid)
  const currency = currencyCode(object.currency)
  if (!invoiceId || !subscriptionId || amount === null || currency === null) {
    return null
  }

  return {
    idempotencyKey: `invoice.paid:${invoiceId}`,
    partnerEvent: {
      amount,
      currency,
      invoiceId,
      kind: 'sale',
      providerPaymentId: paymentId,
      providerSubscriptionId: subscriptionId,
    },
    provider: 'stripe',
  }
}

export async function createWebhookApiResponse(
  request: Request,
  provider: Provider,
  env: BillingWebhookEnv = process.env,
  clientOverride?: WebhookConvexClient,
  applyDiscount: ApplyReferralDiscount = applyReferralDiscountForUser,
): Promise<Response> {
  const rawBody = await readWebhookBody(request)
  if (rawBody === null) {
    return json({ error: 'Webhook payload is too large.' }, { status: 413 })
  }
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

  let event: unknown
  try {
    event = JSON.parse(rawBody)
  } catch {
    return json({ error: 'Invalid webhook body.' }, { status: 400 })
  }
  const partnerMutationPayload =
    env.DUB_PARTNERS_ENABLED?.trim().toLowerCase() === 'true'
      ? provider === 'razorpay'
        ? razorpayPartnerPayloadToMutation(event)
        : stripePartnerPayloadToMutation(event)
      : null
  if (partnerMutationPayload !== null) {
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    try {
      await client.mutation(api.partners.applyPartnerBillingWebhook, {
        secret: mutationSecret,
        ...partnerMutationPayload,
      })
    } catch {
      return json({ error: 'Webhook processing failed.' }, { status: 502 })
    }
    return json({ received: true })
  }

  const mutationPayload =
    provider === 'stripe'
      ? stripePayloadToMutation(event)
      : razorpayPayloadToMutation(event)
  if (mutationPayload === null) return json({ received: true, ignored: true })

  const client = clientOverride ?? createRuntimeConvexHttpClient()
  let result: { referralUnlock?: { referrerUserId: string } | null }
  try {
    result = (await client.mutation(api.billing.applyBillingWebhook, {
      secret: mutationSecret,
      ...mutationPayload,
    })) as { referralUnlock?: { referrerUserId: string } | null }
  } catch {
    return json({ error: 'Webhook processing failed.' }, { status: 502 })
  }

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

  // Best-effort Slack notification — never blocks the webhook response.
  const subscriptionPayload =
    'subscription' in mutationPayload ? mutationPayload.subscription : null
  const creditsPayload =
    'credits' in mutationPayload ? mutationPayload.credits : undefined
  const paymentType: 'subscription' | 'credit_pack' = subscriptionPayload
    ? 'subscription'
    : 'credit_pack'
  void sendBusinessNotification(
    paymentDoneEvent({
      provider: mutationPayload.provider,
      userId: mutationPayload.userId,
      type: paymentType,
      planId: subscriptionPayload?.planId,
      credits: creditsPayload,
    }),
    env,
  ).catch(() => {})

  return json({ received: true })
}
