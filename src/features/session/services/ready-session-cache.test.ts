import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  forgetReadySessionPreview,
  forgetReadySession,
  getReadySessionCacheKey,
  readReadySessionCache,
  readReadySessionPreview,
  rememberReadySession,
  rememberReadySessionPreview,
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

  it('stores and reads ready preview snapshots by session id', () => {
    const storage = createStorage()

    rememberReadySessionPreview(storage, {
      sessionId: ' session_ready_preview ',
      status: 'preview_ready',
      prompt: '  Build a cached dashboard ',
      preferredLanguage: 'EN',
      homeModule: {
        moduleKey: 'home',
        source: ' <html><body>Ready</body></html> ',
        status: 'succeeded',
        updatedAt: 1234,
      },
      tasks: [{ id: 'homepage', title: 'Homepage', status: 'succeeded' }],
      createdAt: 1000,
    })

    expect(
      readReadySessionPreview(storage, {
        sessionId: 'session_ready_preview',
        now: 2000,
      }),
    ).toMatchObject({
      sessionId: 'session_ready_preview',
      status: 'preview_ready',
      prompt: 'Build a cached dashboard',
      preferredLanguage: 'en',
      homeModule: {
        source: '<html><body>Ready</body></html>',
      },
    })
  })

  it('expires invalid ready preview snapshots and supports invalidation', () => {
    const storage = createStorage()

    rememberReadySessionPreview(storage, {
      sessionId: 'session_ready_preview',
      status: 'preview_ready',
      prompt: 'Build a cached dashboard',
      preferredLanguage: 'en',
      homeModule: {
        source: '<html><body>Ready</body></html>',
      },
      createdAt: 1000,
    })

    expect(
      readReadySessionPreview(storage, {
        sessionId: 'session_ready_preview',
        now: 8 * 24 * 60 * 60 * 1000,
      }),
    ).toBeNull()

    rememberReadySessionPreview(storage, {
      sessionId: 'session_ready_preview',
      status: 'preview_ready',
      prompt: 'Build a cached dashboard',
      preferredLanguage: 'en',
      homeModule: {
        source: '<html><body>Ready</body></html>',
      },
    })
    forgetReadySessionPreview(storage, { sessionId: 'session_ready_preview' })
    expect(
      readReadySessionPreview(storage, {
        sessionId: 'session_ready_preview',
      }),
    ).toBeNull()
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
    const fetchSession = vi.fn(() => new Promise<Response>(() => {}))

    const verification = verifyReadySession(
      {
        sessionId: 'session_ready',
        prompt: 'a blog about dogs',
        preferredLanguage: 'en',
        timeoutMs: 1,
      },
      fetchSession,
    )

    await expect(verification).resolves.toBeNull()
  })
})
