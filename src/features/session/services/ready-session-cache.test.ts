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
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
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

const realOpenUiHandoffReadyPreview = {
  sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
  prompt:
    'a boutique coffee roastery with subscription delivery and tasting events',
  html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
  preferredLanguage: 'english',
  source:
    'home_hero = EcommerceHero("Boutique Coffee Roastery", "Crafted for Connoisseurs", "Subscribe for fresh beans delivered to your door")\nroot = PageSwitch(["Home"], [home_hero], "", {"Home":"home"})',
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

  it('prunes expired ready session entries before writing a new prompt cache entry', () => {
    const storage = createStorage()
    const oldKey = getReadySessionCacheKey('old prompt', 'en')
    const freshKey = getReadySessionCacheKey('fresh prompt', 'en')
    storage.setItem(
      oldKey,
      JSON.stringify({
        sessionId: 'old_session',
        prompt: 'old prompt',
        preferredLanguage: 'en',
        createdAt: 1_000,
      }),
    )

    rememberReadySession(storage, {
      sessionId: 'fresh_session',
      prompt: 'fresh prompt',
      preferredLanguage: 'en',
      now: 9 * 24 * 60 * 60 * 1000,
    })

    expect(storage.getItem(oldKey)).toBeNull()
    expect(storage.getItem(freshKey)).toContain('fresh_session')
  })

  it('keeps the ready prompt cache bounded to the newest entries', () => {
    const storage = createStorage()

    for (let i = 0; i < 30; i += 1) {
      rememberReadySession(storage, {
        sessionId: `session_${i}`,
        prompt: `cached prompt ${i}`,
        preferredLanguage: 'en',
        now: i + 1,
      })
    }

    const sessionKeys = Array.from({ length: storage.length }, (_, i) =>
      storage.key(i),
    ).filter(
      (key): key is string =>
        key !== null && key.startsWith('ship-fast:ready-session:v1:'),
    )

    expect(sessionKeys.length).toBeLessThanOrEqual(24)
    expect(
      readReadySessionCache(storage, {
        prompt: 'cached prompt 0',
        preferredLanguage: 'en',
        now: 31,
      }),
    ).toBeNull()
    expect(
      readReadySessionCache(storage, {
        prompt: 'cached prompt 29',
        preferredLanguage: 'en',
        now: 31,
      })?.sessionId,
    ).toBe('session_29')
  })

  it('swallows QuotaExceededError from setItem in rememberReadySession', () => {
    const store = new Map<string, string>()
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      removeItem: (key: string) => {
        store.delete(key)
      },
      setItem: () => {
        const err = new Error('Setting the value exceeded the quota')
        err.name = 'QuotaExceededError'
        throw err
      },
    }

    expect(() =>
      rememberReadySession(storage, {
        sessionId: 'session_quota',
        prompt: 'a blog about dogs',
        preferredLanguage: 'en',
        now: 1000,
      }),
    ).not.toThrow()

    // Nothing was persisted; reads return null without crashing.
    expect(
      readReadySessionCache(storage, {
        prompt: 'a blog about dogs',
        preferredLanguage: 'en',
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
          openUiSource: realRendererErrorReadyPreview.html,
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

  it('rejects a verified ready session when the session API exposes DB-observed OpenUI handoff preview HTML', async () => {
    const fetchSession = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sessionId: realOpenUiHandoffReadyPreview.sessionId,
        prompt: realOpenUiHandoffReadyPreview.prompt,
        preferredLanguage: realOpenUiHandoffReadyPreview.preferredLanguage,
        status: 'preview_ready',
        homeModule: {
          moduleKey: 'home',
          source: realOpenUiHandoffReadyPreview.source,
          status: 'succeeded',
        },
        preview: {
          openUiSource: realOpenUiHandoffReadyPreview.html,
          version: 1,
        },
      }),
    })

    await expect(
      verifyReadySession(
        {
          sessionId: realOpenUiHandoffReadyPreview.sessionId,
          prompt: realOpenUiHandoffReadyPreview.prompt,
          preferredLanguage: realOpenUiHandoffReadyPreview.preferredLanguage,
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
          openUiSource: '',
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
