import { internalMutation, query } from './_generated/server'
import { v } from 'convex/values'

// Early adopter management
export const incrementEarlyAdopterCount = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const doc = await ctx.db.query('earlyAdopters').first()
    if (!doc) {
      const id = await ctx.db.insert('earlyAdopters', { count: 1, users: [userId] })
      return { count: 1, id }
    }
    
    if (doc.users.includes(userId)) return { count: doc.count, id: doc._id }
    if (doc.count >= 500) throw new Error('Early adopter slots full')
    
    await ctx.db.patch(doc._id, {
      count: doc.count + 1,
      users: [...doc.users, userId],
    })
    return { count: doc.count + 1, id: doc._id }
  },
})

export const getEarlyAdopterStatus = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query('earlyAdopters').first()
    return {
      count: doc?.count ?? 0,
      users: doc?.users ?? [],
      slotsRemaining: Math.max(0, 500 - (doc?.count ?? 0)),
    }
  },
})

export const isEarlyAdopterSlotAvailable = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query('earlyAdopters').first()
    return (doc?.count ?? 0) < 500
  },
})

// Credits management
export const getUserCredits = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const credits = await ctx.db
      .query('customerCredits')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()
    return credits?.remaining ?? 0
  },
})

export const addUserCredits = internalMutation({
  args: { userId: v.string(), amount: v.number(), paymentRef: v.optional(v.string()) },
  handler: async (ctx, { userId, amount, paymentRef }) => {
    const existing = await ctx.db
      .query('customerCredits')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (existing) {
      // Check for duplicate paymentRef
      if (paymentRef && existing.history.some((h) => h.paymentRef === paymentRef)) {
        return
      }

      const newHistory = [
        ...existing.history,
        { type: 'purchase' as const, amount, paymentRef, at: new Date().toISOString() },
      ].slice(-100)

      await ctx.db.patch(existing._id, {
        remaining: existing.remaining + amount,
        history: newHistory,
      })
    } else {
      await ctx.db.insert('customerCredits', {
        userId,
        remaining: amount,
        history: [{ type: 'purchase' as const, amount, paymentRef, at: new Date().toISOString() }],
      })
    }
  },
})

export const consumeUserCredit = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const credits = await ctx.db
      .query('customerCredits')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (!credits || credits.remaining <= 0) return false

    const newHistory = [
      ...credits.history,
      { type: 'consume' as const, amount: 1, at: new Date().toISOString() },
    ].slice(-100)

    await ctx.db.patch(credits._id, {
      remaining: credits.remaining - 1,
      history: newHistory,
    })
    return true
  },
})

export const zeroUserCredits = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const credits = await ctx.db
      .query('customerCredits')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    if (!credits) return

    const newHistory = [
      ...credits.history,
      { type: 'refund' as const, amount: 0, at: new Date().toISOString() },
    ].slice(-100)

    await ctx.db.patch(credits._id, {
      remaining: 0,
      history: newHistory,
    })
  },
})

// Subscription management
export const hasActiveSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const sub = await ctx.db
      .query('subscriptions')
      .withIndex('by_userId_status', (q) => q.eq('userId', userId).eq('status', 'active'))
      .first()
    return !!sub
  },
})

export const hadActiveSubscriptionDuring = query({
  args: { userId: v.string(), timestamp: v.number() },
  handler: async (ctx, { userId, timestamp }) => {
    const subs = await ctx.db
      .query('subscriptions')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect()

    for (const sub of subs) {
      if (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'authenticated') {
        return true
      }
      if (sub.canceledAt && sub.canceledAt > timestamp) {
        return true
      }
    }
    return false
  },
})

export const upsertSubscription = internalMutation({
  args: {
    userId: v.string(),
    provider: v.union(v.literal('stripe'), v.literal('razorpay')),
    status: v.union(
      v.literal('active'),
      v.literal('cancelled'),
      v.literal('trialing'),
      v.literal('authenticated'),
      v.literal('past_due'),
    ),
    planId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
    razorpaySubscriptionId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    rawStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args
    const now = Date.now()

    // Check for existing subscription
    const existingStripe = data.stripeSubscriptionId
      ? await ctx.db
          .query('subscriptions')
          .withIndex('by_stripeSubscriptionId', (q) => q.eq('stripeSubscriptionId', data.stripeSubscriptionId!))
          .first()
      : null

    const existingRazorpay = data.razorpaySubscriptionId
      ? await ctx.db
          .query('subscriptions')
          .withIndex('by_razorpaySubscriptionId', (q) => q.eq('razorpaySubscriptionId', data.razorpaySubscriptionId!))
          .first()
      : null

    const existing = existingStripe || existingRazorpay

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...data,
        updatedAt: now,
        ...(data.status === 'cancelled' ? { canceledAt: now } : {}),
      })
    } else {
      await ctx.db.insert('subscriptions', {
        userId,
        ...data,
        price: data.planId,
        createdAt: now,
        updatedAt: now,
      })
    }
  },
})

// Webhook idempotency
export const markWebhookProcessed = internalMutation({
  args: { idempotencyKey: v.string(), provider: v.union(v.literal('stripe'), v.literal('razorpay')) },
  handler: async (ctx, { idempotencyKey, provider }) => {
    try {
      await ctx.db.insert('webhookEvents', {
        idempotencyKey,
        provider,
        processedAt: Date.now(),
      })
      return true
    } catch (e) {
      // Unique constraint violation means already processed
      return false
    }
  },
})
