import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MAX_FREE_PER_MONTH, MAX_PAID_PER_MONTH } from './constants'
import { userMonthlyHits } from '../lib/rate-limit'
import {
  getUserGenerationQuota,
  setActiveSubscriptionLookupForTest,
} from './payments'

let subscribedUids = new Set<string>()

describe('generation quota details', () => {
  beforeEach(() => {
    subscribedUids = new Set()
    userMonthlyHits.clear()
    setActiveSubscriptionLookupForTest((uid: string) => subscribedUids.has(uid))
  })

  afterEach(() => {
    setActiveSubscriptionLookupForTest(null)
  })

  it('reports signed-up free monthly quota', async () => {
    userMonthlyHits.set('free-user', [Date.now(), Date.now()])

    await expect(
      getUserGenerationQuota('free-user', '203.0.113.11'),
    ).resolves.toMatchObject({
      isAnonymous: false,
      isSubscribed: false,
      monthlyLimit: MAX_FREE_PER_MONTH,
      monthlyUsed: 2,
      monthlyRemaining: MAX_FREE_PER_MONTH - 2,
    })
  }, 120000)

  it('reports subscribed monthly quota', async () => {
    subscribedUids.add('paid-user')
    userMonthlyHits.set('paid-user', [Date.now(), Date.now(), Date.now()])

    await expect(
      getUserGenerationQuota('paid-user', '203.0.113.12'),
    ).resolves.toMatchObject({
      isAnonymous: false,
      isSubscribed: true,
      monthlyLimit: MAX_PAID_PER_MONTH,
      monthlyUsed: 3,
      monthlyRemaining: MAX_PAID_PER_MONTH - 3,
    })
  }, 120000)
})
