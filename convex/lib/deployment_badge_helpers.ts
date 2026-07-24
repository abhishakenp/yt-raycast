import type { QueryCtx } from '../_generated/server'
import { areExportPaywallsDisabled } from './session_export_helpers'

const activeBadgeSubscriptionStatuses = new Set([
  'active',
  'trialing',
  'authenticated',
])

/**
 * Read-only check: should a public deployment show a "Built with Ship Fast"
 * badge? Returns true when the session owner has no active subscription and
 * the paywall is not disabled. Does NOT consume credits — this is a
 * render-time check, not an export entitlement.
 */
export async function resolveDeploymentBadgeEntitlement(
  ctx: Pick<QueryCtx, 'db'>,
  userId: string | undefined,
): Promise<boolean> {
  if (areExportPaywallsDisabled()) return false
  if (userId === undefined) return true

  const subscriptions = await ctx.db
    .query('subscriptions')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .take(20)

  const hasActiveSubscription = subscriptions.some((sub) =>
    activeBadgeSubscriptionStatuses.has(sub.status),
  )

  return !hasActiveSubscription
}
