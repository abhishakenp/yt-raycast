import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DAILY_WINDOW_MS,
  MAX_ANON_PER_DAY,
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  SHARE_BONUS_EXTRA,
} from './constants'
import { anonIpDailyHits, shareBonusIps, userMonthlyHits } from '../lib/rate-limit'

let subscribedUids = new Set<string>()

vi.mock('../billing/payments.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../billing/payments.js')>()
  return {
    ...actual,
    hasActiveSubscription: async (uid: string) => subscribedUids.has(uid),
  }
})

describe('generation quota details', () => {
  beforeEach(() => {
    subscribedUids = new Set()
    userMonthlyHits.clear()
    anonIpDailyHits.clear()
    shareBonusIps.clear()
  })

  it('reports anonymous daily quota including share bonus', async () => {
    const { getUserGenerationQuota } = await import('./payments.js')
    const ip = '203.0.113.10'
    const today = new Date().toISOString().slice(0, 10)
    anonIpDailyHits.set(ip, [Date.now(), Date.now() - DAILY_WINDOW_MS - 1])
    shareBonusIps.set(ip, today)

    await expect(getUserGenerationQuota(null, ip)).resolves.toMatchObject({
      isAnonymous: true,
      isSubscribed: false,
      dailyLimit: MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA,
      dailyUsed: 1,
      dailyRemaining: MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA - 1,
    })
  }, 120000)

  it('reports signed-up free monthly quota', async () => {
    const { getUserGenerationQuota } = await import('./payments.js')
    userMonthlyHits.set('free-user', [Date.now(), Date.now()])

    await expect(getUserGenerationQuota('free-user', '203.0.113.11')).resolves.toMatchObject({
      isAnonymous: false,
      isSubscribed: false,
      monthlyLimit: MAX_FREE_PER_MONTH,
      monthlyUsed: 2,
      monthlyRemaining: MAX_FREE_PER_MONTH - 2,
    })
  }, 120000)

  it('reports subscribed monthly quota', async () => {
    const { getUserGenerationQuota } = await import('./payments.js')
    subscribedUids.add('paid-user')
    userMonthlyHits.set('paid-user', [Date.now(), Date.now(), Date.now()])

    await expect(getUserGenerationQuota('paid-user', '203.0.113.12')).resolves.toMatchObject({
      isAnonymous: false,
      isSubscribed: true,
      monthlyLimit: MAX_PAID_PER_MONTH,
      monthlyUsed: 3,
      monthlyRemaining: MAX_PAID_PER_MONTH - 3,
    })
  }, 120000)
})
