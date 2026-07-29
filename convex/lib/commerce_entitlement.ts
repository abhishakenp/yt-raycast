import type { Doc } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { activeSubscriptionStatuses } from './billing_generation_quota'

type EntitlementCtx = Pick<QueryCtx | MutationCtx, 'db'>

type EntitlementSubscription = Pick<
  Doc<'subscriptions'>,
  'status' | 'currentPeriodEnd'
>

// Commerce entitlement is decoupled from `status`: a customer who scheduled
// cancellation already paid for the current period and must keep Medusa
// running until it ends. Rows written before this field existed have no
// currentPeriodEnd yet, so they fall back to the status-based check.
export function isSubscriptionEntitled(
  subscription: EntitlementSubscription,
  now: number,
): boolean {
  if (subscription.currentPeriodEnd !== undefined) {
    return now < subscription.currentPeriodEnd
  }
  return activeSubscriptionStatuses.has(subscription.status)
}

export type CommerceEntitlement = {
  entitled: boolean
  subscription: Doc<'subscriptions'> | null
}

export async function getCommerceEntitlementForUser(
  ctx: EntitlementCtx,
  userId: string,
  now = Date.now(),
): Promise<CommerceEntitlement> {
  const subscriptions = await ctx.db
    .query('subscriptions')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .take(50)

  const entitled = subscriptions
    .filter((subscription) => isSubscriptionEntitled(subscription, now))
    .sort((left, right) => {
      const leftDeadline = left.currentPeriodEnd ?? left.updatedAt
      const rightDeadline = right.currentPeriodEnd ?? right.updatedAt
      return rightDeadline - leftDeadline
    })

  return { entitled: entitled.length > 0, subscription: entitled[0] ?? null }
}
