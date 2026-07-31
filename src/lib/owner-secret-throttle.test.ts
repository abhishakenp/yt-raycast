import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  isOwnerSecretGuessingBlocked,
  isOwnerSecretThrottledError,
  withOwnerSecretThrottle,
} from './owner-secret-throttle'
import { ownerSecretFailureHits } from './rate-limit'

const forbidden = () =>
  Promise.reject(
    new Error('ConvexError: {"code":"FORBIDDEN","message":"You do not own"}'),
  )

const attempt = async (sessionId: string, operation: () => Promise<unknown>) => {
  try {
    return { outcome: 'ok' as const, value: await operation() }
  } catch (error) {
    return {
      outcome: isOwnerSecretThrottledError(error)
        ? ('throttled' as const)
        : ('rejected' as const),
    }
  }
}

describe('anonymous owner-secret throttle', () => {
  beforeEach(() => {
    ownerSecretFailureHits.clear()
  })

  it('refuses further guesses once the per-session budget is spent', async () => {
    const outcomes: string[] = []
    for (let index = 0; index < 21; index += 1) {
      const result = await attempt('session-a', () =>
        withOwnerSecretThrottle('session-a', `guess-${index}`, forbidden),
      )
      outcomes.push(result.outcome)
    }

    expect(outcomes.slice(0, 20)).toEqual(Array(20).fill('rejected'))
    expect(outcomes[20]).toBe('throttled')
    expect(isOwnerSecretGuessingBlocked('session-a')).toBe(true)
  })

  it('throttles per session, so one target cannot lock out others', async () => {
    for (let index = 0; index < 20; index += 1) {
      await attempt('session-a', () =>
        withOwnerSecretThrottle('session-a', `guess-${index}`, forbidden),
      )
    }

    expect(isOwnerSecretGuessingBlocked('session-a')).toBe(true)
    expect(isOwnerSecretGuessingBlocked('session-b')).toBe(false)
  })

  it('clears the counter after a successful authorization', async () => {
    for (let index = 0; index < 5; index += 1) {
      await attempt('session-c', () =>
        withOwnerSecretThrottle('session-c', `guess-${index}`, forbidden),
      )
    }

    await withOwnerSecretThrottle('session-c', 'the-real-secret', async () => ({
      saved: true,
    }))

    expect(ownerSecretFailureHits.get('owner-secret:session-c')).toBeUndefined()
  })

  it('does not count non-ownership failures against the budget', async () => {
    for (let index = 0; index < 25; index += 1) {
      await attempt('session-d', () =>
        withOwnerSecretThrottle('session-d', 'secret', () =>
          Promise.reject(new Error('TEXT_NOT_FOUND')),
        ),
      )
    }

    expect(isOwnerSecretGuessingBlocked('session-d')).toBe(false)
  })

  it('lets the window expire', async () => {
    vi.useFakeTimers()
    try {
      for (let index = 0; index < 20; index += 1) {
        await attempt('session-e', () =>
          withOwnerSecretThrottle('session-e', `guess-${index}`, forbidden),
        )
      }
      expect(isOwnerSecretGuessingBlocked('session-e')).toBe(true)

      vi.advanceTimersByTime(15 * 60 * 1000 + 1)
      expect(isOwnerSecretGuessingBlocked('session-e')).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })
})
