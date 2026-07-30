import type { Doc } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  MONTHLY_WINDOW_MS,
} from './billing_constants'

export const activeSubscriptionStatuses = new Set([
  'active',
  'trialing',
  'authenticated',
])

type QuotaCtx = Pick<QueryCtx | MutationCtx, 'db'>

export type GenerationQuotaSnapshot = {
  limit: number
  used: number
  remaining: number
  exhausted: boolean
  activeSubscriptionCount: number
  canRenew: boolean
}

export const getActiveSubscriptionsForUser = async (
  ctx: QuotaCtx,
  userId: string,
): Promise<Array<Doc<'subscriptions'>>> => {
  const subscriptions = await ctx.db
    .query('subscriptions')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .take(50)

  return subscriptions
    .filter((subscription) =>
      activeSubscriptionStatuses.has(subscription.status),
    )
    .sort((left, right) => {
      const leftTime = left.updatedAt ?? left.createdAt
      const rightTime = right.updatedAt ?? right.createdAt
      return rightTime - leftTime
    })
}

export const getGenerationQuotaForUser = async (
  ctx: QuotaCtx,
  userId: string,
  now = Date.now(),
): Promise<GenerationQuotaSnapshot> => {
  const activeSubscriptions = await getActiveSubscriptionsForUser(ctx, userId)
  const activeSubscriptionCount = activeSubscriptions.length
  const limit =
    activeSubscriptionCount > 0
      ? activeSubscriptionCount * MAX_PAID_PER_MONTH
      : MAX_FREE_PER_MONTH
  const cutoff = now - MONTHLY_WINDOW_MS
  const sessions = await ctx.db
    .query('sessions')
    .withIndex('by_userId_createdAt', (index) =>
      index.eq('userId', userId).gte('createdAt', cutoff),
    )
    .take(limit + 1)
  const used = sessions.length
  const remaining = Math.max(0, limit - used)

  return {
    limit,
    used,
    remaining,
    exhausted: remaining === 0,
    activeSubscriptionCount,
    canRenew: activeSubscriptionCount > 0 && remaining === 0,
  }
}
