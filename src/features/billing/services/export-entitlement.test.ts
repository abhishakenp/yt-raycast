import { describe, expect, it } from 'vitest'

import {
  hasExportSubscriptionAccess,
  resolveExportEntitlement,
} from './export-entitlement'

describe('export entitlement', () => {
  it('recognizes active subscription statuses', () => {
    expect(hasExportSubscriptionAccess('active')).toBe(true)
    expect(hasExportSubscriptionAccess('trialing')).toBe(true)
    expect(hasExportSubscriptionAccess('authenticated')).toBe(true)
    expect(hasExportSubscriptionAccess('past_due')).toBe(false)
    expect(hasExportSubscriptionAccess('cancelled')).toBe(false)
  })

  it('blocks anonymous paid export downloads', () => {
    expect(resolveExportEntitlement({ userId: null })).toMatchObject({
      canDownload: false,
      requiresPayment: true,
      includeBadge: true,
      consumeCredit: false,
      reason: 'anonymous',
    })
  })

  it('unlocks badge-free exports for subscribed users', () => {
    expect(
      resolveExportEntitlement({
        userId: 'user_123',
        subscriptionStatus: 'active',
      }),
    ).toMatchObject({
      canDownload: true,
      requiresPayment: false,
      includeBadge: false,
      consumeCredit: false,
      reason: 'subscription',
    })
  })

  it('unlocks badge-free exports by consuming one credit', () => {
    expect(
      resolveExportEntitlement({
        userId: 'user_123',
        creditsRemaining: 2,
      }),
    ).toMatchObject({
      canDownload: true,
      requiresPayment: false,
      includeBadge: false,
      consumeCredit: true,
      reason: 'credits',
    })
  })

  it('requires payment when a signed-in user has no entitlement', () => {
    expect(
      resolveExportEntitlement({
        userId: 'user_123',
        subscriptionStatus: 'cancelled',
        creditsRemaining: 0,
      }),
    ).toMatchObject({
      canDownload: false,
      requiresPayment: true,
      includeBadge: true,
      consumeCredit: false,
      reason: 'payment_required',
    })
  })
})
