// @vitest-environment jsdom
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useReferralCode } from './useReferralCode'

const originalFetch = globalThis.fetch

function mockWindowClerk(loaded: boolean, hasUser: boolean) {
  const clerk: Record<string, unknown> = { loaded }
  if (hasUser) {
    clerk.user = { primaryEmailAddress: { emailAddress: 'test@test.com' } }
    clerk.session = {
      getToken: vi.fn(async () => 'fake-token'),
    }
  }
  ;(window as unknown as { Clerk?: unknown }).Clerk = clerk
}

function clearWindowClerk() {
  delete (window as unknown as { Clerk?: unknown }).Clerk
}

describe('useReferralCode', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    globalThis.fetch = originalFetch
    clearWindowClerk()
    cleanup()
  })

  it('returns null code when signed out (no Clerk session)', async () => {
    mockWindowClerk(true, false)

    const { result } = renderHook(() => useReferralCode())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.code).toBeNull()
  })

  it('fetches and returns the referral code when signed in', async () => {
    mockWindowClerk(true, true)
    globalThis.fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ code: 'TESTCODE' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    ) as unknown as typeof fetch

    const { result } = renderHook(() => useReferralCode())

    await waitFor(() => {
      expect(result.current.code).toBe('TESTCODE')
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('returns null code when the API responds with an error', async () => {
    mockWindowClerk(true, true)
    globalThis.fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: 'fail' }), { status: 503 }),
    ) as unknown as typeof fetch

    const { result } = renderHook(() => useReferralCode())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.code).toBeNull()
  })

  it('stops polling after a persistent API error (no wasted retries)', async () => {
    mockWindowClerk(true, true)
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: 'fail' }), { status: 503 }),
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    renderHook(() => useReferralCode())

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    // Wait past one poll interval to confirm no retry.
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
