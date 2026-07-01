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

const realRendererErrorReadyPreview = {
  sessionId: 'k57fkjjt99avgnxyzq7w3xy46589nmy3',
  prompt:
    'This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a polished interactive product experience. It should be dark mode. Focus on making it beautiful.',
  html: '<!doctype html><html lang="en"><head><title>Nyx</title></head><body><div id="openui-root"><div class="openui-error">Failed to render: te is not a function</div></div></body></html>',
  preferredLanguage: 'en',
} as const

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

  it('does not store ready preview snapshots that contain real OpenUI renderer-error HTML', () => {
    const storage = createStorage()

    rememberReadySessionPreview(storage, {
      sessionId: realRendererErrorReadyPreview.sessionId,
      status: 'preview_ready',
      prompt: realRendererErrorReadyPreview.prompt,
      preferredLanguage: realRendererErrorReadyPreview.preferredLanguage,
      homeModule: {
        moduleKey: 'home',
        source: realRendererErrorReadyPreview.html,
        status: 'succeeded',
      },
      preview: {
        html: realRendererErrorReadyPreview.html,
        version: 1,
      },
      createdAt: 1000,
    })

    expect(
      readReadySessionPreview(storage, {
        sessionId: realRendererErrorReadyPreview.sessionId,
        now: 2000,
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

  it('treats a successful non-JSON session API response as a verification miss', async () => {
    const fetchSession = vi.fn().mockResolvedValue(
      new Response('<!doctype html><h1>Gateway failure</h1>', {
        headers: { 'content-type': 'text/html' },
        status: 200,
      }),
    )

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

  it('rejects a verified ready session when the session API exposes renderer-error preview HTML', async () => {
    const fetchSession = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sessionId: realRendererErrorReadyPreview.sessionId,
        prompt: realRendererErrorReadyPreview.prompt,
        preferredLanguage: realRendererErrorReadyPreview.preferredLanguage,
        status: 'preview_ready',
        preview: {
          html: realRendererErrorReadyPreview.html,
          version: 1,
        },
      }),
    })

    await expect(
      verifyReadySession(
        {
          sessionId: realRendererErrorReadyPreview.sessionId,
          prompt: realRendererErrorReadyPreview.prompt,
          preferredLanguage: realRendererErrorReadyPreview.preferredLanguage,
        },
        fetchSession,
      ),
    ).resolves.toBeNull()
  })

  it('rejects a verified ready session when the session API has no renderable preview content', async () => {
    const fetchSession = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sessionId: realRendererErrorReadyPreview.sessionId,
        prompt: realRendererErrorReadyPreview.prompt,
        preferredLanguage: realRendererErrorReadyPreview.preferredLanguage,
        status: 'preview_ready',
        homeModule: {
          moduleKey: 'home',
          source: '',
          status: 'succeeded',
        },
        preview: {
          html: '',
          version: 1,
        },
      }),
    })

    await expect(
      verifyReadySession(
        {
          sessionId: realRendererErrorReadyPreview.sessionId,
          prompt: realRendererErrorReadyPreview.prompt,
          preferredLanguage: realRendererErrorReadyPreview.preferredLanguage,
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
