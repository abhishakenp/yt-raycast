import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  forgetReadySession,
  getReadySessionCacheKey,
  readReadySessionCache,
  rememberReadySession,
  verifyReadySession,
} from './ready-session-cache'

const createStorage = () => {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    removeItem: (key: string) => {
      store.delete(key)
    },
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

describe('ready session cache', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('stores and reads prompt-language scoped ready sessions', () => {
    const storage = createStorage()

    rememberReadySession(storage, {
      sessionId: 'session_ready',
      prompt: '  A BLOG about dogs ',
      preferredLanguage: 'EN',
      now: 1000,
    })

    expect(
      readReadySessionCache(storage, {
        prompt: 'a blog about dogs',
        preferredLanguage: 'en',
        now: 2000,
      }),
    ).toMatchObject({
      sessionId: 'session_ready',
      prompt: 'a blog about dogs',
      preferredLanguage: 'en',
    })
  })

  it('expires old entries and supports explicit invalidation', () => {
    const storage = createStorage()
    const key = getReadySessionCacheKey('a blog about dogs', 'en')
    rememberReadySession(storage, {
      sessionId: 'session_ready',
      prompt: 'a blog about dogs',
      preferredLanguage: 'en',
      now: 1000,
    })

    expect(
      readReadySessionCache(storage, {
        prompt: 'a blog about dogs',
        preferredLanguage: 'en',
        now: 8 * 24 * 60 * 60 * 1000,
      }),
    ).toBeNull()
    expect(storage.getItem(key)).toBeNull()

    rememberReadySession(storage, {
      sessionId: 'session_ready',
      prompt: 'a blog about dogs',
      preferredLanguage: 'en',
      now: 1000,
    })
    forgetReadySession(storage, {
      prompt: 'a blog about dogs',
      preferredLanguage: 'en',
    })
    expect(storage.getItem(key)).toBeNull()
  })

  it('verifies a ready session against the session API before reuse', async () => {
    const fetchSession = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sessionId: 'session_ready',
        prompt: 'a blog about dogs',
        preferredLanguage: 'en',
        status: 'preview_ready',
      }),
    })

    await expect(
      verifyReadySession(
        {
          sessionId: 'session_ready',
          prompt: 'a blog about dogs',
          preferredLanguage: 'en',
        },
        fetchSession,
      ),
    ).resolves.toBe('session_ready')
    expect(fetchSession).toHaveBeenCalledWith(
      '/api/sessions/session_ready',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        signal: expect.any(AbortSignal),
      }),
    )
  })

  it('rejects stale or mismatched verified sessions', async () => {
    const fetchSession = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sessionId: 'session_ready',
        prompt: 'a blog about cats',
        preferredLanguage: 'en',
        status: 'preview_ready',
      }),
    })

    await expect(
      verifyReadySession(
        {
          sessionId: 'session_ready',
          prompt: 'a blog about dogs',
          preferredLanguage: 'en',
        },
        fetchSession,
      ),
    ).resolves.toBeNull()
  })

  it('returns null quickly when ready-session verification stalls', async () => {
    vi.useFakeTimers()
    const fetchSession = vi.fn(() => new Promise<Response>(() => {}))

    const verification = verifyReadySession(
      {
        sessionId: 'session_ready',
        prompt: 'a blog about dogs',
        preferredLanguage: 'en',
        timeoutMs: 25,
      },
      fetchSession,
    )

    await vi.advanceTimersByTimeAsync(25)

    await expect(verification).resolves.toBeNull()
  })
})
