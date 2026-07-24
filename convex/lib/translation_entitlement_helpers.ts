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
