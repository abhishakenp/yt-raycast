import { ConvexError, v } from 'convex/values'

import { internal } from './_generated/api'
import type { Doc } from './_generated/dataModel'
import { env, internalMutation, mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import {
  getOrBackfillAcquisitionAttribution,
  insertAcquisitionAttribution,
} from './lib/acquisition_attribution'
import { getDubRetryDelayMs } from './lib/dub_outbox'

const OUTBOX_LEASE_MS = 60_000
const partnerBillingEvent = v.union(
  v.object({
    amount: v.number(),
    currency: v.string(),
    invoiceId: v.string(),
    kind: v.literal('sale'),
    providerPaymentId: v.optional(v.string()),
    providerSubscriptionId: v.string(),
  }),
  v.object({
    amount: v.number(),
    currency: v.string(),
    invoiceId: v.string(),
    kind: v.literal('refund'),
    providerPaymentId: v.optional(v.string()),
    remainingAmount: v.number(),
    refundId: v.string(),
  }),
)

function isPartnersEnabled(): boolean {
  return env.DUB_PARTNERS_ENABLED?.trim().toLowerCase() === 'true'
}

function requirePartnersEnabled(): void {
  if (isPartnersEnabled()) return
  throw new ConvexError({
    code: 'PARTNERS_DISABLED',
    message: 'Partner attribution is not available.',
  })
}

function requireBillingSecret(secret: string): void {
  if (
    !env.BILLING_WEBHOOK_MUTATION_SECRET ||
    secret !== env.BILLING_WEBHOOK_MUTATION_SECRET
  ) {
    throw new ConvexError({
      code: 'FORBIDDEN',
      message: 'Partner billing operation is not authorized.',
    })
  }
}

async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new ConvexError({
      code: 'UNAUTHENTICATED',
      message: 'Sign in to access partners.',
    })
  }
  return identity
}

export const getMyPartnerIdentity = query({
  args: {},
  handler: async (ctx) => {
    requirePartnersEnabled()
    const identity = await requireIdentity(ctx)
    return {
      email: identity.email ?? null,
      emailVerified: identity.emailVerified === true,
      image: identity.pictureUrl ?? null,
      name: identity.name ?? null,
      tenantId: identity.tokenIdentifier,
    }
  },
})

export const claimDubAttribution = mutation({
  args: {
    clickId: v.string(),
  },
  handler: async (ctx, args) => {
    requirePartnersEnabled()
    const identity = await requireIdentity(ctx)
    const userId = identity.tokenIdentifier
    const clickId = args.clickId.trim()
    if (!clickId || clickId.length > 256) {
      throw new ConvexError({
        code: 'INVALID_CLICK_ID',
        message: 'Partner click identifier is invalid.',
      })
    }

    const existing = await getOrBackfillAcquisitionAttribution(ctx, userId)
    if (existing) {
      return existing.source === 'native_referral'
        ? Object.freeze({ claimed: false, reason: 'native_referral_won' })
        : Object.freeze({ claimed: false, reason: 'already_claimed' })
    }

    const now = Date.now()
    await insertAcquisitionAttribution(ctx, {
      claimedAt: now,
      source: 'dub_partner',
      sourceKey: clickId,
      userId,
    })
    const eventId = await ctx.db.insert('dubEventOutbox', {
      attemptCount: 0,
      clickId,
      createdAt: now,
      idempotencyKey: `dub:lead:${userId}`,
      kind: 'lead',
      nextAttemptAt: now,
      status: 'pending',
      updatedAt: now,
      userId,
      ...(identity.email ? { customerEmail: identity.email } : {}),
      ...(identity.name ? { customerName: identity.name } : {}),
      ...(identity.pictureUrl ? { customerAvatar: identity.pictureUrl } : {}),
    })
    await ctx.scheduler.runAfter(
      0,
      internal.partners_worker.processOutboxEvent,
      { eventId },
    )

    return Object.freeze({ claimed: true, reason: 'claimed' })
  },
})

export const claimOutboxEvent = internalMutation({
  args: {
    eventId: v.id('dubEventOutbox'),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (
      !event ||
      event.status === 'completed' ||
      event.status === 'dead_letter'
    ) {
      return null
    }
    if (
      event.status === 'processing' &&
      (event.leaseExpiresAt ?? 0) > args.now
    ) {
      return null
    }
    if (event.status === 'pending' && event.nextAttemptAt > args.now) {
      return null
    }

    const attemptCount = event.attemptCount + 1
    const leaseExpiresAt = args.now + OUTBOX_LEASE_MS
    await ctx.db.patch(event._id, {
      attemptCount,
      leaseExpiresAt,
      status: 'processing',
      updatedAt: args.now,
    })
    await ctx.scheduler.runAt(
      leaseExpiresAt,
      internal.partners_worker.processOutboxEvent,
      { eventId: event._id },
    )
    return {
      ...event,
      attemptCount,
      leaseExpiresAt,
      status: 'processing',
      updatedAt: args.now,
    } satisfies Doc<'dubEventOutbox'>
  },
})

export const completeOutboxEvent = internalMutation({
  args: {
    eventId: v.id('dubEventOutbox'),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event || event.status === 'completed') return null
    if (event.status === 'dead_letter') return null

    await ctx.db.patch(event._id, {
      completedAt: args.now,
      status: 'completed',
      updatedAt: args.now,
    })
    return { completed: true }
  },
})

export const failOutboxEvent = internalMutation({
  args: {
    error: v.string(),
    eventId: v.id('dubEventOutbox'),
    now: v.number(),
    terminal: v.boolean(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (!event || event.status === 'completed') {
      return { deadLetter: false, nextAttemptAt: null }
    }
    if (event.status === 'dead_letter') {
      return { deadLetter: true, nextAttemptAt: null }
    }

    const retryDelay = getDubRetryDelayMs(event.attemptCount)
    const deadLetter = args.terminal || retryDelay === null
    const nextAttemptAt = deadLetter ? null : args.now + retryDelay
    await ctx.db.patch(event._id, {
      lastError: args.error.slice(0, 1000),
      nextAttemptAt: nextAttemptAt ?? event.nextAttemptAt,
      status: deadLetter ? 'dead_letter' : 'pending',
      updatedAt: args.now,
    })
    return { deadLetter, nextAttemptAt }
  },
})

export const applyPartnerBillingWebhook = mutation({
  args: {
    idempotencyKey: v.string(),
    partnerEvent: partnerBillingEvent,
    provider: v.union(v.literal('razorpay'), v.literal('stripe')),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    requirePartnersEnabled()
    requireBillingSecret(args.secret)

    const idempotencyKey = args.idempotencyKey.trim()
    const invoiceId = args.partnerEvent.invoiceId.trim()
    const currency = args.partnerEvent.currency.trim().toLowerCase()
    if (
      !idempotencyKey ||
      !invoiceId ||
      !Number.isSafeInteger(args.partnerEvent.amount) ||
      args.partnerEvent.amount <= 0 ||
      !/^[a-z]{3}$/.test(currency) ||
      (args.partnerEvent.kind === 'refund' &&
        (!args.partnerEvent.refundId.trim() ||
          !Number.isSafeInteger(args.partnerEvent.remainingAmount) ||
          args.partnerEvent.remainingAmount < 0))
    ) {
      throw new ConvexError({
        code: 'INVALID_PARTNER_BILLING_EVENT',
        message: 'Partner billing event is invalid.',
      })
    }

    const existingWebhook = await ctx.db
      .query('webhookEvents')
      .withIndex('by_provider_idempotencyKey', (index) =>
        index
          .eq('provider', args.provider)
          .eq('idempotencyKey', idempotencyKey),
      )
      .unique()
    if (existingWebhook) {
      return { processed: false, queued: false }
    }

    const now = Date.now()
    let userId: string
    let outboxIdempotencyKey: string
    if (args.partnerEvent.kind === 'sale') {
      const providerSubscriptionId =
        args.partnerEvent.providerSubscriptionId.trim()
      if (!providerSubscriptionId) {
        throw new ConvexError({
          code: 'INVALID_PARTNER_BILLING_EVENT',
          message: 'Subscription identifier is required.',
        })
      }
      const subscription = await ctx.db
        .query('subscriptions')
        .withIndex('by_provider_and_providerSubscriptionId', (index) =>
          index
            .eq('provider', args.provider)
            .eq('providerSubscriptionId', providerSubscriptionId),
        )
        .unique()
      if (!subscription) {
        throw new ConvexError({
          code: 'PARTNER_SUBSCRIPTION_NOT_FOUND',
          message: 'Subscription was not found.',
        })
      }
      userId = subscription.userId

      const attribution = await getOrBackfillAcquisitionAttribution(ctx, userId)
      if (attribution?.source !== 'dub_partner') {
        await ctx.db.insert('webhookEvents', {
          idempotencyKey,
          processedAt: now,
          provider: args.provider,
        })
        return { processed: true, queued: false }
      }
      outboxIdempotencyKey = `dub:sale:${args.provider}:${invoiceId}`
    } else {
      const originalSale = await ctx.db
        .query('dubEventOutbox')
        .withIndex('by_kind_and_invoiceId', (index) =>
          index.eq('kind', 'sale').eq('invoiceId', invoiceId),
        )
        .unique()
      if (!originalSale || originalSale.kind !== 'sale') {
        throw new ConvexError({
          code: 'PARTNER_SALE_NOT_FOUND',
          message: 'Dub sale was not found for the refunded invoice.',
        })
      }
      if (
        currency !== originalSale.currency.trim().toLowerCase() ||
        args.partnerEvent.remainingAmount >= originalSale.amount ||
        args.partnerEvent.amount + args.partnerEvent.remainingAmount >
          originalSale.amount
      ) {
        throw new ConvexError({
          code: 'INVALID_PARTNER_BILLING_EVENT',
          message: 'Partner refund does not match its original sale.',
        })
      }
      userId = originalSale.userId
      outboxIdempotencyKey = `dub:refund:razorpay:${args.partnerEvent.refundId.trim()}`
    }

    const existingOutbox = await ctx.db
      .query('dubEventOutbox')
      .withIndex('by_idempotencyKey', (index) =>
        index.eq('idempotencyKey', outboxIdempotencyKey),
      )
      .unique()
    let eventId = existingOutbox?._id
    if (!eventId) {
      eventId =
        args.partnerEvent.kind === 'sale'
          ? await ctx.db.insert('dubEventOutbox', {
              amount: args.partnerEvent.amount,
              attemptCount: 0,
              createdAt: now,
              currency,
              idempotencyKey: outboxIdempotencyKey,
              invoiceId,
              kind: 'sale',
              nextAttemptAt: now,
              paymentProcessor: 'custom',
              provider: args.provider,
              providerPaymentId: args.partnerEvent.providerPaymentId,
              providerSubscriptionId:
                args.partnerEvent.providerSubscriptionId.trim(),
              status: 'pending',
              updatedAt: now,
              userId,
            })
          : await ctx.db.insert('dubEventOutbox', {
              amount: args.partnerEvent.amount,
              attemptCount: 0,
              createdAt: now,
              currency,
              idempotencyKey: outboxIdempotencyKey,
              invoiceId,
              kind: 'refund',
              nextAttemptAt: now,
              provider: args.provider,
              providerPaymentId: args.partnerEvent.providerPaymentId,
              remainingAmount: args.partnerEvent.remainingAmount,
              refundId: args.partnerEvent.refundId.trim(),
              status: 'pending',
              updatedAt: now,
              userId,
            })
      await ctx.scheduler.runAfter(
        0,
        internal.partners_worker.processOutboxEvent,
        { eventId },
      )
    }

    await ctx.db.insert('webhookEvents', {
      idempotencyKey,
      processedAt: now,
      provider: args.provider,
    })
    return { processed: true, queued: existingOutbox === null }
  },
})
