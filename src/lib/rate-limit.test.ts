import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  checkRateLimit,
  cleanupMap,
  getAnonDailyLimit,
  refundRateLimit,
  shareBonusIps,
} from './rate-limit'

describe('rate limit helpers', () => {
  afterEach(() => {
    vi.useRealTimers()
    shareBonusIps.clear()
  })

  it('tracks hits inside a rolling window and permits again after expiry', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    const hits = new Map<string, number[]>()

    expect(checkRateLimit('ip:1', hits, 2, 1000)).toBe(true)
    expect(checkRateLimit('ip:1', hits, 2, 1000)).toBe(true)
    expect(checkRateLimit('ip:1', hits, 2, 1000)).toBe(false)

    vi.setSystemTime(new Date('2026-01-01T00:00:01.001Z'))

    expect(checkRateLimit('ip:1', hits, 2, 1000)).toBe(true)
  })

  it('refunds the latest hit for failed work', () => {
    const hits = new Map<string, number[]>()

    expect(checkRateLimit('user:1', hits, 1, 1000)).toBe(true)
    expect(checkRateLimit('user:1', hits, 1, 1000)).toBe(false)
    refundRateLimit('user:1', hits)

    expect(checkRateLimit('user:1', hits, 1, 1000)).toBe(true)
  })

  it('cleans stale buckets and applies same-day share bonuses', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-03T12:00:00.000Z'))
    const hits = new Map([
      ['fresh', [Date.now() - 100]],
      ['stale', [Date.now() - 5000]],
    ])

    cleanupMap(hits, 1000)
    shareBonusIps.set('127.0.0.1', '2026-02-03')

    expect(hits.has('fresh')).toBe(true)
    expect(hits.has('stale')).toBe(false)
    expect(getAnonDailyLimit('127.0.0.1')).toBeGreaterThan(
      getAnonDailyLimit('missing'),
    )
  })
})
