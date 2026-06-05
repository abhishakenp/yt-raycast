import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_ANON_PER_DAY,
  MAX_FREE_PER_MONTH,
  MAX_PER_USER,
  RATE_WINDOW_MS,
} from '../billing/constants.ts'
import {
  activeGenerations,
  anonIpDailyHits,
  exportHits,
  ipHits,
  ipMonthlyHits,
  promptSuggestIpHits,
  shareBonusIps,
  userHits,
  userMonthlyHits,
} from '../lib/rate-limit.ts'
import { buildQuotaUsagePayload } from './quota-monitoring.js'

describe('quota monitoring', () => {
  beforeEach(() => {
    activeGenerations.clear()
    anonIpDailyHits.clear()
    exportHits.clear()
    ipHits.clear()
    ipMonthlyHits.clear()
    promptSuggestIpHits.clear()
    shareBonusIps.clear()
    userHits.clear()
    userMonthlyHits.clear()
  })

  it('summarizes active quota maps without counting expired hits', () => {
    const now = Date.parse('2026-06-05T00:00:00.000Z')
    anonIpDailyHits.set('203.0.113.1', [now, now - 1_000])
    anonIpDailyHits.set('203.0.113.2', [now - 48 * 60 * 60 * 1000])
    userHits.set('user-a', Array.from({ length: MAX_PER_USER }, () => now))
    userMonthlyHits.set('user-b', Array.from({ length: MAX_FREE_PER_MONTH - 1 }, () => now))
    activeGenerations.set('user-a', 2)

    const payload = buildQuotaUsagePayload({ now, sampleSize: 2 })

    expect(payload.usage.anonymousDaily).toMatchObject({
      keys: 1,
      used: 2,
      limitPerKey: MAX_ANON_PER_DAY,
    })
    expect(payload.usage.userRateWindow).toMatchObject({
      keys: 1,
      exhaustedKeys: 1,
      limitPerKey: MAX_PER_USER,
    })
    expect(payload.usage.signedInMonthly.topKeys[0]).toMatchObject({
      key: 'user-b',
      used: MAX_FREE_PER_MONTH - 1,
      remaining: 1,
    })
    expect(payload.usage.activeGenerations).toMatchObject({
      keys: 1,
      active: 2,
      saturatedKeys: 1,
    })
  })

  it('exposes share bonus and rate-window metadata for dashboards', () => {
    const now = Date.parse('2026-06-05T00:00:00.000Z')
    shareBonusIps.set('203.0.113.3', '2026-06-05')
    shareBonusIps.set('203.0.113.4', '2026-06-04')

    const payload = buildQuotaUsagePayload({ now })

    expect(payload.windows.rateWindowMs).toBe(RATE_WINDOW_MS)
    expect(payload.usage.anonymousDaily.shareBonusKeys).toBe(1)
    expect(payload.limits.subscribedMonthly).toBeGreaterThan(payload.limits.signedUpMonthly)
  })
})
