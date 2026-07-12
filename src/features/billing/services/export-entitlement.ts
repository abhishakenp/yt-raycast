export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'authenticated'
  | 'past_due'
  | 'cancelled'
  | null
  | undefined

export type ExportEntitlementInput = {
  userId?: string | null
  subscriptionStatus?: SubscriptionStatus
  creditsRemaining?: number | null
  historicalSubscriptionActive?: boolean
  paywallDisabled?: boolean
}

export type ExportEntitlementDecision = {
  canDownload: boolean
  requiresPayment: boolean
  includeBadge: boolean
  consumeCredit: boolean
  reason:
    | 'paywall_disabled'
    | 'anonymous'
    | 'subscription'
    | 'historical_subscription'
    | 'credits'
    | 'payment_required'
}

const activeSubscriptionStatuses = new Set([
  'active',
  'trialing',
  'authenticated',
])

function normalizeCredits(credits: number | null | undefined): number {
  return Number.isFinite(credits) ? Math.max(0, Math.floor(Number(credits))) : 0
}

export function hasExportSubscriptionAccess(
  status: SubscriptionStatus,
): boolean {
  return activeSubscriptionStatuses.has(String(status))
}

export function resolveExportEntitlement(
  input: ExportEntitlementInput,
): ExportEntitlementDecision {
  if (input.paywallDisabled === true) {
    return {
      canDownload: true,
      requiresPayment: false,
      includeBadge: false,
      consumeCredit: false,
      reason: 'paywall_disabled',
    }
  }

  if (!input.userId) {
    return {
      canDownload: false,
      requiresPayment: true,
      includeBadge: true,
      consumeCredit: false,
      reason: 'anonymous',
    }
  }

  if (hasExportSubscriptionAccess(input.subscriptionStatus)) {
    return {
      canDownload: true,
      requiresPayment: false,
      includeBadge: false,
      consumeCredit: false,
      reason: 'subscription',
    }
  }

  if (input.historicalSubscriptionActive === true) {
    return {
      canDownload: true,
      requiresPayment: false,
      includeBadge: false,
      consumeCredit: false,
      reason: 'historical_subscription',
    }
  }

  if (normalizeCredits(input.creditsRemaining) > 0) {
    return {
      canDownload: true,
      requiresPayment: false,
      includeBadge: false,
      consumeCredit: true,
      reason: 'credits',
    }
  }

  return {
    canDownload: false,
    requiresPayment: true,
    includeBadge: true,
    consumeCredit: false,
    reason: 'payment_required',
  }
}
