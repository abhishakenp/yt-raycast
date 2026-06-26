import { ConvexError, v } from 'convex/values'

import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { classifyReferralEmail } from './lib/disposable_email'
import {
  generateReferralCode,
  normalizeReferralCode,
  REFERRAL_DISCOUNT_PERCENT,
  REFERRAL_THRESHOLD,
  referralsRemaining,
} from './lib/referral_helpers'
import { refreshReferralReward } from './lib/referral_qualification'

const activeSubscriptionStatuses = new Set([
  'active',
  'trialing',
  'authenticated',
])

const requireUserId = async (ctx: QueryCtx | MutationCtx): Promise<string> => {
  const identity = await ctx.auth.getUserIdentity()
  const userId = identity?.tokenIdentifier
  if (userId === undefined) {
    throw new ConvexError({
      code: 'UNAUTHENTICATED',
      message: 'Sign in to access referrals.',
    })
  }
  return userId
}

const requireServerSecret = (secret: string) => {
  const expected = process.env.BILLING_WEBHOOK_MUTATION_SECRET
  if (!expected || secret !== expected) {
    throw new ConvexError({
      code: 'FORBIDDEN',
      message: 'Referral server operation is not authorized.',
    })
  }
}

const getActiveSubscriptionForUser = async (
  ctx: QueryCtx | MutationCtx,
  userId: string,
) => {
  const subscriptions = await ctx.db
    .query('subscriptions')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .take(20)
  return (
    subscriptions.find((subscription) =>
      activeSubscriptionStatuses.has(subscription.status),
    ) ?? null
  )
}

const findCodeOwner = async (ctx: QueryCtx | MutationCtx, code: string) => {
  if (!code) return null
  return await ctx.db
    .query('referralCodes')
    .withIndex('by_code', (index) => index.eq('code', code))
    .first()
}

const ensureReferralCode = async (
  ctx: MutationCtx,
  userId: string,
): Promise<string> => {
  const existing = await ctx.db
    .query('referralCodes')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .first()
  if (existing !== null) return existing.code

  // Generate a unique code, retrying on the unlikely collision.
  let code = generateReferralCode()
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const clash = await findCodeOwner(ctx, code)
    if (clash === null) break
    code = generateReferralCode()
  }

  await ctx.db.insert('referralCodes', {
    userId,
    code,
    createdAt: Date.now(),
  })
  return code
}

/** Ensure the current user has a referral code and return it. */
export const getOrCreateMyReferralCode = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx)
    const code = await ensureReferralCode(ctx, userId)
    return { code }
  },
})

/** Full referral dashboard state for the current user. */
export const getMyReferralStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx)

    const codeRow = await ctx.db
      .query('referralCodes')
      .withIndex('by_userId', (index) => index.eq('userId', userId))
      .first()

    const referrals = await ctx.db
      .query('referrals')
      .withIndex('by_referrer', (index) => index.eq('referrerUserId', userId))
      .collect()

    const reward = await ctx.db
      .query('referralRewards')
      .withIndex('by_userId', (index) => index.eq('userId', userId))
      .first()

    const qualifiedCount = referrals.filter(
      (referral) => referral.status === 'qualified',
    ).length
    const pendingCount = referrals.filter(
      (referral) => referral.status === 'pending',
    ).length
    const unlocked = reward?.unlocked ?? qualifiedCount >= REFERRAL_THRESHOLD

    const subscription = await getActiveSubscriptionForUser(ctx, userId)

    return {
      code: codeRow?.code ?? null,
      threshold: REFERRAL_THRESHOLD,
      discountPercent: REFERRAL_DISCOUNT_PERCENT,
      qualifiedCount,
      pendingCount,
      remaining: referralsRemaining(qualifiedCount),
      unlocked,
      unlockedAt: reward?.unlockedAt ?? null,
      discountApplied: reward?.discountAppliedAt != null,
      discountActive: unlocked && subscription !== null,
      hasActiveSubscription: subscription !== null,
      // Sanitized list (no other user's identifiers leak — only masked emails).
      referrals: referrals
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((referral) => ({
          status: referral.status,
          email: maskEmail(referral.referredEmail),
          createdAt: referral.createdAt,
          paidAt: referral.paidAt ?? null,
        })),
    }
  },
})

const maskEmail = (email: string | undefined): string | null => {
  if (!email) return null
  const [local, domain] = email.split('@')
  if (!domain) return null
  const head = local.slice(0, 2)
  return `${head}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`
}

/**
 * Record that the current (authenticated) user signed up via `code`.
 * Called by the frontend right after sign-in when a captured ?ref= code exists.
 * Trusts the authenticated tokenIdentifier; prefers the verified identity email
 * and falls back to a client-provided email only when the JWT omits it.
 */
export const recordReferralSignup = mutation({
  args: {
    code: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const referredUserId = await requireUserId(ctx)
    const identity = await ctx.auth.getUserIdentity()
    const code = normalizeReferralCode(args.code)

    if (!code) return { recorded: false, reason: 'invalid_code' as const }

    const owner = await findCodeOwner(ctx, code)
    if (owner === null)
      return { recorded: false, reason: 'invalid_code' as const }
    if (owner.userId === referredUserId)
      return { recorded: false, reason: 'self_referral' as const }

    // A user can only ever be attributed to one referrer.
    const existing = await ctx.db
      .query('referrals')
      .withIndex('by_referred', (index) =>
        index.eq('referredUserId', referredUserId),
      )
      .first()
    if (existing !== null)
      return { recorded: false, reason: 'already_referred' as const }

    const identityEmail =
      typeof identity?.email === 'string' ? identity.email : ''
    const emailSource = identityEmail
      ? 'identity'
      : args.email
        ? 'client'
        : 'none'
    const classified = classifyReferralEmail(identityEmail || args.email)

    const now = Date.now()
    await ctx.db.insert('referrals', {
      referrerUserId: owner.userId,
      referredUserId,
      code,
      referredEmail: classified.email || undefined,
      emailDisposable: classified.email ? classified.disposable : undefined,
      emailSource,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })

    // Edge case: the referred user already pays (e.g. ref captured after
    // checkout). Qualify immediately so the reward isn't lost, unless their
    // email is disposable.
    if (classified.acceptable) {
      const subscription = await getActiveSubscriptionForUser(
        ctx,
        referredUserId,
      )
      if (subscription !== null) {
        const referral = await ctx.db
          .query('referrals')
          .withIndex('by_referred', (index) =>
            index.eq('referredUserId', referredUserId),
          )
          .first()
        if (referral !== null) {
          await ctx.db.patch(referral._id, {
            status: 'qualified',
            paidAt: now,
            updatedAt: now,
          })
          await refreshReferralReward(ctx, owner.userId)
        }
      }
    }

    return { recorded: true, reason: 'ok' as const }
  },
})

/**
 * Server-gated: context needed to apply the provider discount for `userId`.
 * Returns the reward state and the user's currently active subscription.
 */
export const getDiscountApplicationContext = query({
  args: {
    secret: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args.secret)

    const reward = await ctx.db
      .query('referralRewards')
      .withIndex('by_userId', (index) => index.eq('userId', args.userId))
      .first()
    const subscription = await getActiveSubscriptionForUser(ctx, args.userId)

    return {
      unlocked: reward?.unlocked ?? false,
      discountPercent: reward?.discountPercent ?? REFERRAL_DISCOUNT_PERCENT,
      discountApplied: reward?.discountAppliedAt != null,
      subscription:
        subscription === null
          ? null
          : {
              provider: subscription.provider,
              providerSubscriptionId:
                subscription.providerSubscriptionId ?? null,
            },
    }
  },
})

/** Server-gated: is `userId` eligible for the referral discount at checkout? */
export const isDiscountUnlockedForUser = query({
  args: {
    secret: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args.secret)
    const reward = await ctx.db
      .query('referralRewards')
      .withIndex('by_userId', (index) => index.eq('userId', args.userId))
      .first()
    return {
      unlocked: reward?.unlocked ?? false,
      discountPercent: reward?.discountPercent ?? REFERRAL_DISCOUNT_PERCENT,
    }
  },
})

/** Server-gated: record that the provider discount has been applied. */
export const markReferralDiscountApplied = mutation({
  args: {
    secret: v.string(),
    userId: v.string(),
    provider: v.union(v.literal('stripe'), v.literal('razorpay')),
    providerDiscountId: v.string(),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireServerSecret(args.secret)
    const now = Date.now()

    const reward = await ctx.db
      .query('referralRewards')
      .withIndex('by_userId', (index) => index.eq('userId', args.userId))
      .first()
    if (reward !== null) {
      await ctx.db.patch(reward._id, {
        discountAppliedAt: now,
        discountProvider: args.provider,
        discountProviderId: args.providerDiscountId,
        discountSubscriptionId: args.subscriptionId,
        updatedAt: now,
      })
    }

    // Mirror onto the subscription row for an at-a-glance audit trail.
    if (args.subscriptionId) {
      const subscription = await ctx.db
        .query('subscriptions')
        .withIndex('by_providerSubscriptionId', (index) =>
          index.eq('providerSubscriptionId', args.subscriptionId),
        )
        .first()
      if (subscription !== null) {
        await ctx.db.patch(subscription._id, {
          referralDiscountPercent:
            reward?.discountPercent ?? REFERRAL_DISCOUNT_PERCENT,
          referralDiscountAppliedAt: now,
          referralDiscountProviderId: args.providerDiscountId,
        })
      }
    }

    return { ok: true }
  },
})
