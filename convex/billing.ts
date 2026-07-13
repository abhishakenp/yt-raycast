import { ConvexError, v } from 'convex/values'

import type { Doc } from './_generated/dataModel'
import { internalMutation, mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { qualifyReferralOnPayment } from './lib/referral_qualification'

const activeSubscriptionStatuses = new Set<Doc<'subscriptions'>['status']>([
  'active',
  'trialing',
  'authenticated',
])

async function getUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  const userId = identity?.tokenIdentifier

  if (userId === undefined) {
    throw new ConvexError({
      code: 'UNAUTHENTICATED',
      message: 'Sign in to view billing details.',
    })
  }

  return userId
}

async function getActiveSubscription(
  ctx: QueryCtx | MutationCtx,
  userId: string,
) {
  const candidates = await Promise.all(
    [...activeSubscriptionStatuses].map((status) =>
      ctx.db
        .query('subscriptions')
        .withIndex('by_userId_status', (index) =>
          index.eq('userId', userId).eq('status', status),
        )
        .order('desc')
        .first(),
    ),
  )

  return candidates.reduce<Doc<'subscriptions'> | null>(
    (latest, candidate) =>
      candidate !== null &&
      (latest === null || candidate.updatedAt > latest.updatedAt)
        ? candidate
        : latest,
    null,
  )
}

async function getCredits(ctx: QueryCtx | MutationCtx, userId: string) {
  const credits = await ctx.db
    .query('customerCredits')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .first()

  return credits?.remaining ?? 0
}

async function requireBillingReadAccess(
  ctx: QueryCtx,
  requestedUserId: string,
): Promise<void> {
  // Historical server callers use opaque, non-Clerk user ids. Clerk user ids
  // include the issuer separator and must always be bound to the caller.
  if (!requestedUserId.includes('|')) return

  const identity = await ctx.auth.getUserIdentity()
  if (identity?.tokenIdentifier === requestedUserId) return

  throw new ConvexError({
    code: identity === null ? 'UNAUTHENTICATED' : 'FORBIDDEN',
    message: 'Billing details are available only to their owner.',
  })
}

async function findProviderSubscription(
  ctx: QueryCtx | MutationCtx,
  provider: Doc<'subscriptions'>['provider'],
  providerSubscriptionId: string | undefined,
): Promise<Doc<'subscriptions'> | null> {
  if (providerSubscriptionId === undefined) return null

  const candidates = await ctx.db
    .query('subscriptions')
    .withIndex('by_providerSubscriptionId', (index) =>
      index.eq('providerSubscriptionId', providerSubscriptionId),
    )
    .take(10)
  return (
    candidates.find((subscription) => subscription.provider === provider) ??
    null
  )
}

export const getSubscriptionStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx)
    const subscription = await getActiveSubscription(ctx, userId)

    return {
      active: subscription !== null,
      status: subscription?.status ?? null,
      provider: subscription?.provider ?? null,
      planId: subscription?.planId ?? null,
      updatedAt: subscription?.updatedAt ?? null,
    }
  },
})

export const getCreditBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx)

    return {
      remaining: await getCredits(ctx, userId),
    }
  },
})

export const getBillingOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx)
    const [subscription, credits] = await Promise.all([
      getActiveSubscription(ctx, userId),
      getCredits(ctx, userId),
    ])

    return {
      userId,
      subscription: {
        active: subscription !== null,
        status: subscription?.status ?? null,
        provider: subscription?.provider ?? null,
        planId: subscription?.planId ?? null,
      },
      credits: {
        remaining: credits,
      },
      exportAccess: {
        unlocked: subscription !== null || credits > 0,
        viaSubscription: subscription !== null,
        viaCredits: subscription === null && credits > 0,
      },
    }
  },
})

export const hasActiveSubscription = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBillingReadAccess(ctx, args.userId)
    return (await getActiveSubscription(ctx, args.userId)) !== null
  },
})

export const getUserCredits = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBillingReadAccess(ctx, args.userId)
    return await getCredits(ctx, args.userId)
  },
})

export const addCreditsForUser = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0)
      return { remaining: await getCredits(ctx, args.userId) }

    const now = Date.now()
    const existing = await ctx.db
      .query('customerCredits')
      .withIndex('by_userId', (index) => index.eq('userId', args.userId))
      .first()

    if (existing === null) {
      const creditsId = await ctx.db.insert('customerCredits', {
        userId: args.userId,
        remaining: args.amount,
        updatedAt: now,
      })
      return { creditsId, remaining: args.amount }
    }

    const remaining = existing.remaining + args.amount
    await ctx.db.patch(existing._id, { remaining, updatedAt: now })

    return { creditsId: existing._id, remaining }
  },
})

export const upsertSubscriptionForUser = internalMutation({
  args: {
    userId: v.string(),
    provider: v.union(v.literal('stripe'), v.literal('razorpay')),
    status: v.union(
      v.literal('active'),
      v.literal('trialing'),
      v.literal('authenticated'),
      v.literal('past_due'),
      v.literal('cancelled'),
    ),
    planId: v.string(),
    providerSubscriptionId: v.optional(v.string()),
    providerCheckoutId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const existing = await findProviderSubscription(
      ctx,
      args.provider,
      args.providerSubscriptionId,
    )

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        userId: args.userId,
        provider: args.provider,
        status: args.status,
        planId: args.planId,
        providerCheckoutId: args.providerCheckoutId,
        updatedAt: now,
        canceledAt: args.status === 'cancelled' ? now : undefined,
      })
      return { subscriptionId: existing._id }
    }

    const subscriptionId = await ctx.db.insert('subscriptions', {
      userId: args.userId,
      provider: args.provider,
      status: args.status,
      planId: args.planId,
      providerSubscriptionId: args.providerSubscriptionId,
      providerCheckoutId: args.providerCheckoutId,
      createdAt: now,
      updatedAt: now,
      canceledAt: args.status === 'cancelled' ? now : undefined,
    })

    return { subscriptionId }
  },
})

export const recordWebhookEvent = internalMutation({
  args: {
    provider: v.union(v.literal('stripe'), v.literal('razorpay')),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('webhookEvents')
      .withIndex('by_provider_idempotencyKey', (index) =>
        index
          .eq('provider', args.provider)
          .eq('idempotencyKey', args.idempotencyKey),
      )
      .first()

    if (existing !== null) {
      return { inserted: false }
    }

    await ctx.db.insert('webhookEvents', {
      provider: args.provider,
      idempotencyKey: args.idempotencyKey,
      processedAt: Date.now(),
    })

    return { inserted: true }
  },
})

export const consumeCreditForExport = internalMutation({
  args: {
    userId: v.string(),
    sessionId: v.optional(v.id('sessions')),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('customerCredits')
      .withIndex('by_userId', (index) => index.eq('userId', args.userId))
      .first()

    if (existing === null || existing.remaining <= 0) {
      throw new ConvexError({
        code: 'INSUFFICIENT_CREDITS',
        message: 'No credits remaining.',
      })
    }

    const now = Date.now()
    const remaining = existing.remaining - 1
    await ctx.db.patch(existing._id, { remaining, updatedAt: now })

    await ctx.db.insert('creditLedger', {
      userId: args.userId,
      sessionId: args.sessionId,
      amount: -1,
      balanceAfter: remaining,
      reason: 'export',
      createdAt: now,
    })

    return { creditsId: existing._id, remaining }
  },
})

export const getCreditLedger = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireBillingReadAccess(ctx, args.userId)
    const limit = Math.min(args.limit ?? 50, 100)
    const transactions = await ctx.db
      .query('creditLedger')
      .withIndex('by_userId_createdAt', (index) =>
        index.eq('userId', args.userId),
      )
      .order('desc')
      .take(limit)

    const credits = await ctx.db
      .query('customerCredits')
      .withIndex('by_userId', (index) => index.eq('userId', args.userId))
      .first()

    return {
      current: credits?.remaining ?? 0,
      history: transactions,
    }
  },
})

export const applyBillingWebhook = mutation({
  args: {
    secret: v.string(),
    provider: v.union(v.literal('stripe'), v.literal('razorpay')),
    idempotencyKey: v.string(),
    userId: v.string(),
    subscription: v.optional(
      v.object({
        status: v.union(
          v.literal('active'),
          v.literal('trialing'),
          v.literal('authenticated'),
          v.literal('past_due'),
          v.literal('cancelled'),
        ),
        planId: v.string(),
        providerSubscriptionId: v.optional(v.string()),
        providerCheckoutId: v.optional(v.string()),
      }),
    ),
    credits: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.BILLING_WEBHOOK_MUTATION_SECRET
    if (!expectedSecret || args.secret !== expectedSecret) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Webhook mutation is not authorized.',
      })
    }

    const idempotencyKey = args.idempotencyKey.trim()
    const userId = args.userId.trim()
    const credits = args.credits
    if (!idempotencyKey || !userId) {
      throw new ConvexError({
        code: 'INVALID_BILLING_EVENT',
        message: 'Billing event identifiers must not be blank.',
      })
    }
    if (
      credits !== undefined &&
      (!Number.isSafeInteger(credits) || credits <= 0)
    ) {
      throw new ConvexError({
        code: 'INVALID_BILLING_EVENT',
        message: 'Credit grants must be positive whole numbers.',
      })
    }

    const subscription =
      args.subscription === undefined
        ? undefined
        : {
            ...args.subscription,
            planId: args.subscription.planId.trim(),
            providerSubscriptionId:
              args.subscription.providerSubscriptionId?.trim(),
            providerCheckoutId: args.subscription.providerCheckoutId?.trim(),
          }
    if (
      subscription !== undefined &&
      (!subscription.planId ||
        subscription.providerSubscriptionId === '' ||
        subscription.providerCheckoutId === '')
    ) {
      throw new ConvexError({
        code: 'INVALID_BILLING_EVENT',
        message: 'Subscription identifiers must not be blank.',
      })
    }
    if (subscription === undefined && credits === undefined) {
      throw new ConvexError({
        code: 'INVALID_BILLING_EVENT',
        message: 'Billing events must contain a subscription or credit grant.',
      })
    }

    const existingWebhook = await ctx.db
      .query('webhookEvents')
      .withIndex('by_provider_idempotencyKey', (index) =>
        index
          .eq('provider', args.provider)
          .eq('idempotencyKey', idempotencyKey),
      )
      .first()
    if (existingWebhook !== null) {
      return { processed: false, duplicate: true }
    }

    const existingSubscription = await findProviderSubscription(
      ctx,
      args.provider,
      subscription?.providerSubscriptionId,
    )
    if (
      existingSubscription !== null &&
      existingSubscription.userId !== userId
    ) {
      throw new ConvexError({
        code: 'SUBSCRIPTION_OWNERSHIP_CONFLICT',
        message: 'Provider subscription already belongs to another user.',
      })
    }

    const now = Date.now()
    await ctx.db.insert('webhookEvents', {
      provider: args.provider,
      idempotencyKey,
      processedAt: now,
    })

    let referralUnlock: { referrerUserId: string } | null = null

    if (subscription !== undefined) {
      if (existingSubscription === null) {
        await ctx.db.insert('subscriptions', {
          userId,
          provider: args.provider,
          status: subscription.status,
          planId: subscription.planId,
          providerSubscriptionId: subscription.providerSubscriptionId,
          providerCheckoutId: subscription.providerCheckoutId,
          createdAt: now,
          updatedAt: now,
          canceledAt: subscription.status === 'cancelled' ? now : undefined,
        })
      } else {
        await ctx.db.patch(existingSubscription._id, {
          status: subscription.status,
          planId: subscription.planId,
          providerCheckoutId: subscription.providerCheckoutId,
          updatedAt: now,
          canceledAt: subscription.status === 'cancelled' ? now : undefined,
        })
      }

      // When the payer's subscription is active, attribute any referral that
      // brought them in. Returns the referrer only when their reward JUST
      // unlocked, so the server can apply the lifetime discount.
      if (activeSubscriptionStatuses.has(subscription.status)) {
        const result = await qualifyReferralOnPayment(ctx, userId)
        if (result !== null) {
          referralUnlock = { referrerUserId: result.referrerUserId }
        }
      }
    }

    if (credits !== undefined) {
      const existingCredits = await ctx.db
        .query('customerCredits')
        .withIndex('by_userId', (index) => index.eq('userId', userId))
        .first()
      const balanceAfter = (existingCredits?.remaining ?? 0) + credits
      if (existingCredits === null) {
        await ctx.db.insert('customerCredits', {
          userId,
          remaining: balanceAfter,
          updatedAt: now,
        })
      } else {
        await ctx.db.patch(existingCredits._id, {
          remaining: balanceAfter,
          updatedAt: now,
        })
      }
      await ctx.db.insert('creditLedger', {
        userId,
        amount: credits,
        balanceAfter,
        reason: 'purchase',
        createdAt: now,
      })
    }

    return { processed: true, duplicate: false, referralUnlock }
  },
})
