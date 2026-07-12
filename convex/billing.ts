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

const getUserId = async (ctx: QueryCtx | MutationCtx): Promise<string> => {
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

const getActiveSubscription = async (
  ctx: QueryCtx | MutationCtx,
  userId: string,
) => {
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

const getCredits = async (ctx: QueryCtx | MutationCtx, userId: string) => {
  const credits = await ctx.db
    .query('customerCredits')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .first()

  return credits?.remaining ?? 0
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
  handler: async (ctx, args) =>
    (await getActiveSubscription(ctx, args.userId)) !== null,
})

export const getUserCredits = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => await getCredits(ctx, args.userId),
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
    const existing =
      args.providerSubscriptionId === undefined
        ? null
        : await ctx.db
            .query('subscriptions')
            .withIndex('by_providerSubscriptionId', (index) =>
              index.eq('providerSubscriptionId', args.providerSubscriptionId),
            )
            .first()

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

    const existingWebhook = await ctx.db
      .query('webhookEvents')
      .withIndex('by_provider_idempotencyKey', (index) =>
        index
          .eq('provider', args.provider)
          .eq('idempotencyKey', args.idempotencyKey),
      )
      .first()
    if (existingWebhook !== null) {
      return { processed: false, duplicate: true }
    }

    const now = Date.now()
    await ctx.db.insert('webhookEvents', {
      provider: args.provider,
      idempotencyKey: args.idempotencyKey,
      processedAt: now,
    })

    let referralUnlock: { referrerUserId: string } | null = null

    if (args.subscription !== undefined) {
      const existing =
        args.subscription.providerSubscriptionId === undefined
          ? null
          : await ctx.db
              .query('subscriptions')
              .withIndex('by_providerSubscriptionId', (index) =>
                index.eq(
                  'providerSubscriptionId',
                  args.subscription!.providerSubscriptionId,
                ),
              )
              .first()

      if (existing === null) {
        await ctx.db.insert('subscriptions', {
          userId: args.userId,
          provider: args.provider,
          status: args.subscription.status,
          planId: args.subscription.planId,
          providerSubscriptionId: args.subscription.providerSubscriptionId,
          providerCheckoutId: args.subscription.providerCheckoutId,
          createdAt: now,
          updatedAt: now,
          canceledAt:
            args.subscription.status === 'cancelled' ? now : undefined,
        })
      } else {
        await ctx.db.patch(existing._id, {
          userId: args.userId,
          provider: args.provider,
          status: args.subscription.status,
          planId: args.subscription.planId,
          providerCheckoutId: args.subscription.providerCheckoutId,
          updatedAt: now,
          canceledAt:
            args.subscription.status === 'cancelled' ? now : undefined,
        })
      }

      // When the payer's subscription is active, attribute any referral that
      // brought them in. Returns the referrer only when their reward JUST
      // unlocked, so the server can apply the lifetime discount.
      if (activeSubscriptionStatuses.has(args.subscription.status)) {
        const result = await qualifyReferralOnPayment(ctx, args.userId)
        if (result !== null) {
          referralUnlock = { referrerUserId: result.referrerUserId }
        }
      }
    }

    if ((args.credits ?? 0) > 0) {
      const existingCredits = await ctx.db
        .query('customerCredits')
        .withIndex('by_userId', (index) => index.eq('userId', args.userId))
        .first()
      const balanceAfter =
        (existingCredits?.remaining ?? 0) + (args.credits ?? 0)
      if (existingCredits === null) {
        await ctx.db.insert('customerCredits', {
          userId: args.userId,
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
        userId: args.userId,
        amount: args.credits!,
        balanceAfter,
        reason: 'purchase',
        createdAt: now,
      })
    }

    return { processed: true, duplicate: false, referralUnlock }
  },
})
