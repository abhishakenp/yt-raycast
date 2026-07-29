import type { Doc } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { getCommerceEntitlementForUser } from './commerce_entitlement'
import { transitionCommerceInstanceStatus } from './commerce_instance_helpers'

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000

export type CommerceLifecycleSweepResult = {
  suspended: number
  deleted: number
}

// Selection is by status only, not by the cached entitlementExpiry field:
// that field is a display/debugging hint synced opportunistically (see
// enableCommerceForSession), not guaranteed fresh, so it must never gate
// whether an instance gets checked — only the live entitlement lookup below
// (getCommerceEntitlementForUser) may decide that.
async function findActiveInstancesByStatus(
  ctx: Pick<MutationCtx, 'db'>,
  status: Doc<'commerceInstances'>['status'],
): Promise<Array<Doc<'commerceInstances'>>> {
  return ctx.db
    .query('commerceInstances')
    .withIndex('by_status_and_entitlementExpiry', (index) =>
      index.eq('status', status),
    )
    .collect()
}

// Runs on a schedule (see convex/crons.ts). Two independent checks, each
// re-verifying current entitlement immediately before acting so a payment
// that lands between when entitlementExpiry was recorded and when the sweep
// runs is never punished, and repayment during the 30-day retention window
// resumes existing data instead of losing it to a race.
export async function runCommerceLifecycleSweep(
  ctx: MutationCtx,
  now = Date.now(),
): Promise<CommerceLifecycleSweepResult> {
  let suspended = 0
  let deleted = 0

  const activeInstances = [
    ...(await findActiveInstancesByStatus(ctx, 'ready')),
    ...(await findActiveInstancesByStatus(ctx, 'degraded')),
  ]
  for (const instance of activeInstances) {
    const entitlement = await getCommerceEntitlementForUser(
      ctx,
      instance.ownerUserId,
      now,
    )
    if (entitlement.entitled) continue

    await transitionCommerceInstanceStatus(ctx, instance._id, 'suspending', {}, now)
    suspended += 1
  }

  const suspendedInstances = await findActiveInstancesByStatus(ctx, 'suspended')
  for (const instance of suspendedInstances) {
    if (
      instance.suspendedAt === undefined ||
      now - instance.suspendedAt < RETENTION_MS
    ) {
      continue
    }

    const entitlement = await getCommerceEntitlementForUser(
      ctx,
      instance.ownerUserId,
      now,
    )
    if (entitlement.entitled) continue

    await transitionCommerceInstanceStatus(ctx, instance._id, 'deleting', {}, now)
    deleted += 1
  }

  return { suspended, deleted }
}
