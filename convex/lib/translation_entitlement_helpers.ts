import type { Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { isSessionOwner, isUserAdmin } from './session_access_helpers'
import {
  areExportPaywallsDisabled,
  checkExportEntitlementReadOnly,
  isAuthDisabled,
} from './session_export_helpers'

export type TranslationEntitlementCode =
  | 'ok'
  | 'auth_required'
  | 'not_found'
  | 'forbidden'
  | 'payment_required'

export type TranslationEntitlementResult = {
  allowed: boolean
  code: TranslationEntitlementCode
  message?: string
}

export type CheckTranslationEntitlementInput = {
  sessionId: Id<'sessions'>
  anonymousOwnerSecret?: string
}

/**
 * Keep editing available for one billing cycle after Pro expires. Projects
 * remain online indefinitely; this is only the warning window before we block
 * paid editing features. Provider cancellation webhooks record `canceledAt`
 * at the effective subscription end, with `updatedAt` retained as a legacy
 * fallback for pre-existing cancelled records.
 */
export const EDITING_ENTITLEMENT_GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000

export async function hasEditingGracePeriod(
  ctx: Pick<QueryCtx, 'db'>,
  userId: string | undefined,
  now = Date.now(),
): Promise<boolean> {
  if (userId === undefined) return false

  const subscriptions = await ctx.db
    .query('subscriptions')
    .withIndex('by_userId', (index) => index.eq('userId', userId))
    .take(20)

  return subscriptions.some((subscription) => {
    if (
      subscription.status !== 'cancelled' &&
      subscription.status !== 'past_due'
    ) {
      return false
    }
    const subscriptionEndedAt =
      subscription.canceledAt ??
      subscription.updatedAt ??
      subscription.createdAt
    return now < subscriptionEndedAt + EDITING_ENTITLEMENT_GRACE_PERIOD_MS
  })
}

/**
 * Ownership + Pro entitlement gate for the `/api/translate` HTTP endpoint.
 * Mirrors the export API's `assertCanMutateSession` + `checkExportEntitlementReadOnly`
 * contract but returns a structured result (no throw) so the HTTP handler can
 * map it to 401/403/402 without catching ConvexError.
 *
 * Bypasses (matching exports): `DISABLE_PAYWALL`, `VITE_DISABLE_CLERK`, admin.
 */
export async function checkTranslationEntitlement(
  ctx: QueryCtx,
  args: CheckTranslationEntitlementInput,
): Promise<TranslationEntitlementResult> {
  const session = await ctx.db.get(args.sessionId)
  if (session === null || session.deletedAt !== undefined) {
    return { allowed: false, code: 'not_found', message: 'Session not found' }
  }

  // Auth-disabled / paywall-disabled / admin bypass ownership + pro entirely,
  // mirroring `assertCanMutateSession` and `checkExportEntitlementReadOnly`.
  if (areExportPaywallsDisabled() || isAuthDisabled()) {
    return { allowed: true, code: 'ok' }
  }

  const isAdmin = await isUserAdmin(ctx)
  if (isAdmin) {
    return { allowed: true, code: 'ok' }
  }

  const identity = await ctx.auth.getUserIdentity()
  const isOwner = await isSessionOwner(ctx, session, args.anonymousOwnerSecret)
  if (!isOwner) {
    // An anonymous caller with no auth identity and no owner secret is not an
    // owner — treat as auth_required so the client prompts sign-in, matching
    // the siderail's SignInGate behaviour.
    return {
      allowed: false,
      code: identity === null ? 'auth_required' : 'forbidden',
      message:
        identity === null
          ? 'Sign in to translate this site.'
          : 'You do not own this session',
    }
  }

  const userId = identity?.tokenIdentifier ?? identity?.subject
  const entitlement = await checkExportEntitlementReadOnly(ctx, userId, isAdmin)

  if (entitlement.status === 'ready') {
    return { allowed: true, code: 'ok' }
  }

  return {
    allowed: false,
    code: 'payment_required',
    message:
      entitlement.message ??
      'Subscribe to Pro to translate sites into other languages.',
  }
}

/**
 * Mirrors translation ownership checks, but keeps expired subscribers in the
 * configured editing grace period. Export/deployment and translation retain
 * their normal paid entitlement; the grace applies to editing only.
 */
export async function checkEditingEntitlement(
  ctx: QueryCtx,
  args: CheckTranslationEntitlementInput,
): Promise<TranslationEntitlementResult> {
  const session = await ctx.db.get(args.sessionId)
  if (session === null || session.deletedAt !== undefined) {
    return { allowed: false, code: 'not_found', message: 'Session not found' }
  }

  if (areExportPaywallsDisabled() || isAuthDisabled()) {
    return { allowed: true, code: 'ok' }
  }

  const isAdmin = await isUserAdmin(ctx)
  if (isAdmin) return { allowed: true, code: 'ok' }

  const identity = await ctx.auth.getUserIdentity()
  const isOwner = await isSessionOwner(ctx, session, args.anonymousOwnerSecret)
  if (!isOwner) {
    return {
      allowed: false,
      code: identity === null ? 'auth_required' : 'forbidden',
      message:
        identity === null
          ? 'Sign in to edit this site.'
          : 'You do not own this session',
    }
  }

  const userId = identity?.tokenIdentifier ?? identity?.subject
  const entitlement = await checkExportEntitlementReadOnly(ctx, userId, isAdmin)
  if (
    entitlement.status === 'ready' ||
    (await hasEditingGracePeriod(ctx, userId))
  ) {
    return { allowed: true, code: 'ok' }
  }

  return {
    allowed: false,
    code: 'payment_required',
    message:
      entitlement.message ?? 'Subscribe to Pro to continue editing this site.',
  }
}
