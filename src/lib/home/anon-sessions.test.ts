import { afterEach, describe, expect, it } from 'bun:test'
import { ANON_SESSIONS_KEY } from '@/lib/home/constants'
import { claimAnonSessionsWithUser, saveAnonSession } from './anon-sessions'

const originalFetch = globalThis.fetch
const storage = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, String(value)),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  },
  configurable: true,
})

afterEach(() => {
  storage.clear()
  globalThis.fetch = originalFetch
})

describe('anonymous home sessions', () => {
  it('claims stored anonymous sessions with owner secrets', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      calls.push({ url, init })
      return new Response(JSON.stringify({ claimed: ['session-1'] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as typeof fetch

    saveAnonSession('session-1', 'A bakery website', 'secret-1')

    await claimAnonSessionsWithUser({
      getIdToken: async (forceRefresh?: boolean) => {
        expect(forceRefresh).toBe(true)
        return 'clerk-token'
      },
    })

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/sessions/claim')
    expect((calls[0].init?.headers as Record<string, string>).Authorization).toBe(
      'Bearer clerk-token',
    )
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({
      claims: [{ id: 'session-1', secret: 'secret-1' }],
    })
    expect(localStorage.getItem(ANON_SESSIONS_KEY)).toBeNull()
  })
})
