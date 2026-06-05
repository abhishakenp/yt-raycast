import { describe, expect, it, vi } from 'vitest'
import { checkRateLimit, cleanupMap, refundRateLimit } from './rate-limit'

describe('rate-limit helpers', () => {
  it('blocks after the configured window count', () => {
    const hits = new Map<string, number[]>()
    expect(checkRateLimit('ip:1', hits, 2, 1000)).toBe(true)
    expect(checkRateLimit('ip:1', hits, 2, 1000)).toBe(true)
    expect(checkRateLimit('ip:1', hits, 2, 1000)).toBe(false)
  })

  it('refunds the most recent hit after failed work', () => {
    const hits = new Map<string, number[]>()
    expect(checkRateLimit('user:1', hits, 1, 1000)).toBe(true)
    expect(checkRateLimit('user:1', hits, 1, 1000)).toBe(false)
    refundRateLimit('user:1', hits)
    expect(checkRateLimit('user:1', hits, 1, 1000)).toBe(true)
  })

  it('removes expired keys during cleanup', () => {
    const nowSpy = vi.spyOn(Date, 'now')
    try {
      nowSpy.mockReturnValue(0)
      const hits = new Map<string, number[]>()
      expect(checkRateLimit('ip:old', hits, 1, 1000)).toBe(true)
      nowSpy.mockReturnValue(2000)
      cleanupMap(hits, 1000)
      expect(hits.has('ip:old')).toBe(false)
    } finally {
      nowSpy.mockRestore()
    }
  })
})
