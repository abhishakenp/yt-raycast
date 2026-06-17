import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AUTH_STORAGE_KEY, LEGACY_SHOO_STORAGE_KEY } from './auth-shared'

type MemoryStorage = Storage & {
  entries: Map<string, string>
}

const createMemoryStorage = (): MemoryStorage => {
  const entries = new Map<string, string>()
  return {
    entries,
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => entries.delete(key),
    setItem: (key: string, value: string) => entries.set(key, String(value)),
  } as MemoryStorage
}

const encodeBase64Url = (value: string) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

const createToken = (claims: Record<string, unknown>) =>
  [
    encodeBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' })),
    encodeBase64Url(JSON.stringify(claims)),
    'signature',
  ].join('.')

function installBrowser(
  url = 'https://app.example.com/base/dashboard?x=1#top',
) {
  const parsed = new URL(url)
  const localStorage = createMemoryStorage()
  const sessionStorage = createMemoryStorage()
  const assign = vi.fn()
  const replace = vi.fn()
  const replaceState = vi.fn((_: unknown, __: string, nextUrl: string) => {
    const next = new URL(nextUrl)
    Object.assign(location, {
      hash: next.hash,
      href: next.toString(),
      origin: next.origin,
      pathname: next.pathname,
      search: next.search,
    })
  })
  const location = {
    assign,
    hash: parsed.hash,
    href: parsed.toString(),
    origin: parsed.origin,
    pathname: parsed.pathname,
    replace,
    search: parsed.search,
  }

  vi.stubGlobal('window', {
    __LAKEBED_AUTH__: { shooBaseUrl: 'https://shoo.example.com/' },
    __LAKEBED_BASE_PATH__: '/base/',
    history: { replaceState },
    localStorage,
    location,
    sessionStorage,
  })

  return { assign, localStorage, replace, replaceState, sessionStorage }
}

async function importAuth() {
  vi.resetModules()
  return import('./auth')
}

describe('lakebed browser auth', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('reads current and legacy stored identities with token claims', async () => {
    const { localStorage } = installBrowser()
    const token = createToken({
      email: 'ada@example.com',
      email_verified: true,
      exp: Math.floor(Date.now() / 1000) + 3_600,
      name: 'Ada Lovelace',
      pairwise_sub: 'pairwise-123',
      picture: 'https://example.com/avatar.png',
    })
    localStorage.setItem(
      LEGACY_SHOO_STORAGE_KEY,
      JSON.stringify({ pairwiseSub: 'legacy-user', token }),
    )

    const auth = await importAuth()

    expect(auth.getIdentity()).toEqual({
      expired: false,
      token,
      userId: 'legacy-user',
    })
    expect(auth.getAuthToken()).toBe(token)
    expect(auth.getIdentityClaims()).toMatchObject({
      email: 'ada@example.com',
      pairwise_sub: 'pairwise-123',
    })
    expect(auth.getAuth()).toMatchObject({
      isAuthenticated: true,
      isLoading: true,
      provider: 'google',
      user: {
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        id: 'google:pairwise-123',
      },
    })
  })

  it('exchanges Google callback code, persists identity, and returns to a safe route', async () => {
    vi.setSystemTime(new Date('2026-06-17T12:00:00Z'))
    const { localStorage, replace, replaceState, sessionStorage } =
      installBrowser('https://app.example.com/auth/callback?code=abc&state=s1')
    sessionStorage.setItem(
      'lakebed_google_pkce',
      JSON.stringify({
        createdAt: Date.now(),
        state: 's1',
        verifier: 'verifier-123',
      }),
    )
    sessionStorage.setItem('lakebed_google_return_to', '/dashboard?ok=1')
    const token = createToken({
      exp: Math.floor(Date.now() / 1000) + 3_600,
      name: 'Grace Hopper',
      pairwise_sub: 'pairwise-456',
    })
    const fetchMock = vi.fn(async (_url: URL, _init: RequestInit) => ({
      json: async () => ({
        expires_in: 3600,
        id_token: token,
        pairwise_sub: 'pairwise-456',
      }),
      ok: true,
    }))
    vi.stubGlobal('fetch', fetchMock)

    const auth = await importAuth()
    await auth.ensureAuthInitialized()

    expect(fetchMock).toHaveBeenCalledWith(
      new URL('/token', 'https://shoo.example.com'),
      expect.objectContaining({ method: 'POST' }),
    )
    const body = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams
    expect(body.get('code')).toBe('abc')
    expect(body.get('code_verifier')).toBe('verifier-123')
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toContain('pairwise-456')
    expect(sessionStorage.getItem('lakebed_google_pkce')).toBeNull()
    expect(replaceState).toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith('/dashboard?ok=1')
    expect(auth.getAuth()).toMatchObject({
      isAuthenticated: true,
      isLoading: false,
      provider: 'google',
      userId: 'google:pairwise-456',
    })
  })

  it('starts Google sign-in with PKCE and rejects unsafe return routes', async () => {
    vi.setSystemTime(new Date('2026-06-17T12:00:00Z'))
    const { assign, sessionStorage } = installBrowser()
    const auth = await importAuth()

    const { bundle, url } = await auth.signInWithGoogle({
      callbackPath: '/auth/callback',
      clientId: 'client-123',
      returnTo: 'https://evil.example.com/phish',
      shooBaseUrl: 'https://shoo.example.com/',
    })
    const parsed = new URL(url)

    expect(assign).toHaveBeenCalledWith(url)
    expect(parsed.origin).toBe('https://shoo.example.com')
    expect(parsed.pathname).toBe('/authorize')
    expect(parsed.searchParams.get('client_id')).toBe('client-123')
    expect(parsed.searchParams.get('code_challenge_method')).toBe('S256')
    expect(parsed.searchParams.get('code_challenge')).toBe(bundle.challenge)
    expect(parsed.searchParams.get('state')).toBe(bundle.state)
    expect(
      JSON.parse(sessionStorage.getItem('lakebed_google_pkce') ?? '{}'),
    ).toMatchObject({
      createdAt: Date.now(),
      state: bundle.state,
      verifier: bundle.verifier,
    })
    expect(sessionStorage.getItem('lakebed_google_return_to')).toBe(
      '/base/dashboard?x=1#top',
    )
  })

  it('clears stored identity and returns to guest auth on sign-out', async () => {
    const { localStorage } = installBrowser(
      'https://app.example.com/base/dashboard?lakebed_guest=Preview%20User',
    )
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: createToken({
          exp: Math.floor(Date.now() / 1000) + 3_600,
          pairwise_sub: 'old',
        }),
        userId: 'google:old',
      }),
    )
    localStorage.setItem(LEGACY_SHOO_STORAGE_KEY, '{"pairwiseSub":"old"}')
    const auth = await importAuth()

    auth.signOut()

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(LEGACY_SHOO_STORAGE_KEY)).toBeNull()
    expect(auth.getAuth()).toMatchObject({
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
      provider: 'guest',
      user: {
        displayName: 'Preview User',
        id: 'guest:preview-user',
      },
    })
  })
})
