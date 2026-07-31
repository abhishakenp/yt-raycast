import { ConvexError, v } from 'convex/values'

import type { Doc } from './_generated/dataModel'
import { internalMutation, mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import {
  activeSubscriptionStatuses,
  getActiveSubscriptionsForUser,
  getGenerationQuotaForUser,
} from './lib/billing_generation_quota'
import { qualifyReferralOnPayment } from './lib/referral_qualification'
import { timingSafeEqual } from './lib/timingSafeEqual'

/**
 * Normalize a userId to include the Clerk issuer prefix.
 * `tokenIdentifier` format is `https://<issuer>|<subject>`. Some legacy
 * subscription/credits records were created with bare `<subject>` userIds
 * (e.g., `user_3G04...`) without the issuer prefix, causing them to not
 * match `identity.tokenIdentifier` lookups. This function auto-prefixes
 * bare userIds so both old and new records are consistently keyed.
 */
function normalizeUserId(userId: string): string {
  if (userId.includes('|')) return userId // already prefixed
  const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN
  if (!issuerDomain) return userId // can't prefix without issuer domain
  const issuer = issuerDomain.startsWith('http')
    ? issuerDomain.replace(/\/$/, '')
    : `https://${issuerDomain}`
  return `${issuer}|${userId}`
}

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
  const subscriptions = await getActiveSubscriptionsForUser(ctx, userId)
  return subscriptions[0] ?? null
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
  serverSecret?: string,
): Promise<void> {
  // Server-side callers pass the BILLING_WEBHOOK_MUTATION_SECRET. This allows
  // the Node.js server (which uses ConvexHttpClient without Clerk auth) to
  // query billing info for any userId, including opaque non-Clerk ids.
  const expectedSecret = process.env.BILLING_WEBHOOK_MUTATION_SECRET
  if (
    expectedSecret !== undefined &&
    serverSecret !== undefined &&
    timingSafeEqual(serverSecret, expectedSecret)
  ) {
    return
  }

  // Clerk user ids include the issuer separator (|). The caller MUST be that
  // user — no bypasses for non-Clerk ids without a server secret.
  const identity = await ctx.auth.getUserIdentity()
  if (identity?.tokenIdentifier === requestedUserId) return

  // Admin users can query any billing info.
  if (identity !== null) {
    const isAdmin =
      identity.system_role === 'admin' || identity.systemRole === 'admin'
    if (isAdmin) return
  }

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
    const [subscription, credits, generationQuota] = await Promise.all([
      getActiveSubscription(ctx, userId),
      getCredits(ctx, userId),
      getGenerationQuotaForUser(ctx, userId),
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
      generationQuota,
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
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = normalizeUserId(args.userId)
    await requireBillingReadAccess(ctx, userId, args.secret)
    return (await getActiveSubscription(ctx, userId)) !== null
  },
})

export const getUserCredits = query({
  args: {
    userId: v.string(),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = normalizeUserId(args.userId)
    await requireBillingReadAccess(ctx, userId, args.secret)
    return await getCredits(ctx, userId)
  },
})

export const addCreditsForUser = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = normalizeUserId(args.userId)
    if (args.amount <= 0)
      return { remaining: await getCredits(ctx, userId) }

    const now = Date.now()
    const existing = await ctx.db
      .query('customerCredits')
      .withIndex('by_userId', (index) => index.eq('userId', userId))
      .first()

    if (existing === null) {
      const creditsId = await ctx.db.insert('customerCredits', {
        userId,
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
    const userId = normalizeUserId(args.userId)
    const now = Date.now()
    const existing = await findProviderSubscription(
      ctx,
      args.provider,
      args.providerSubscriptionId,
    )

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        userId,
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
      userId,
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

export const confirmCheckoutSubscription = internalMutation({
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
    providerSubscriptionId: v.string(),
    providerCheckoutId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = normalizeUserId(args.userId)
    const now = Date.now()
    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_providerSubscriptionId', (index) =>
        index.eq('providerSubscriptionId', args.providerSubscriptionId),
      )
      .first()

    if (existing !== null) {
      // Prevent IDOR: only the original owner can update their subscription
      // record. Without this check, an authenticated attacker could call this
      // mutation with a known providerSubscriptionId and steal another user's
      // subscription by patching the userId to their own.
      if (existing.userId !== userId && existing.userId !== args.userId) {
        throw new ConvexError({
          code: 'FORBIDDEN',
          message: 'Subscription does not belong to this user.',
        })
      }
      await ctx.db.patch(existing._id, {
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
      userId,
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
    const userId = normalizeUserId(args.userId)
    const existing = await ctx.db
      .query('customerCredits')
      .withIndex('by_userId', (index) => index.eq('userId', userId))
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
      userId,
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
    secret: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = normalizeUserId(args.userId)
    await requireBillingReadAccess(ctx, userId, args.secret)
    const limit = Math.min(args.limit ?? 50, 100)
    const transactions = await ctx.db
      .query('creditLedger')
      .withIndex('by_userId_createdAt', (index) =>
        index.eq('userId', userId),
      )
      .order('desc')
      .take(limit)

    const credits = await ctx.db
      .query('customerCredits')
      .withIndex('by_userId', (index) => index.eq('userId', userId))
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
    if (!expectedSecret || !timingSafeEqual(args.secret, expectedSecret)) {
      throw new ConvexError({
        code: 'FORBIDDEN',
        message: 'Webhook mutation is not authorized.',
      })
    }

    const idempotencyKey = args.idempotencyKey.trim()
    const userId = normalizeUserId(args.userId.trim())
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

/**
 * One-time backfill: normalize legacy non-prefixed userIds in subscriptions,
 * customerCredits, and creditLedger tables to include the Clerk issuer prefix.
 * Safe to run multiple times — only patches records that lack the `|` separator.
 */
export const backfillPrefixedUserIds = internalMutation({
  args: {},
  handler: async (ctx) => {
    const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN
    if (!issuerDomain) {
      throw new ConvexError({
        code: 'CONFIG_ERROR',
        message: 'CLERK_JWT_ISSUER_DOMAIN is not set.',
      })
    }
    const issuer = issuerDomain.startsWith('http')
      ? issuerDomain.replace(/\/$/, '')
      : `https://${issuerDomain}`

    let patched = 0

    // Subscriptions
    const subscriptions = await ctx.db.query('subscriptions').collect()
    for (const sub of subscriptions) {
      if (sub.userId && !sub.userId.includes('|')) {
        await ctx.db.patch(sub._id, { userId: `${issuer}|${sub.userId}` })
        patched++
      }
    }

    // Customer credits
    const credits = await ctx.db.query('customerCredits').collect()
    for (const credit of credits) {
      if (credit.userId && !credit.userId.includes('|')) {
        await ctx.db.patch(credit._id, { userId: `${issuer}|${credit.userId}` })
        patched++
      }
    }

    // Credit ledger
    const ledger = await ctx.db.query('creditLedger').collect()
    for (const entry of ledger) {
      if (entry.userId && !entry.userId.includes('|')) {
        await ctx.db.patch(entry._id, { userId: `${issuer}|${entry.userId}` })
        patched++
      }
    }

    return { patched }
  },
})
