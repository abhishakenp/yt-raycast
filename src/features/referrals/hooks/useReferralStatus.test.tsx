// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useReferralStatus, type ReferralStatus } from './useReferralStatus'

const originalFetch = globalThis.fetch

const clerkState = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: false,
  getToken: vi.fn(async () => null as string | null),
}))

vi.mock('@clerk/tanstack-react-start', () => ({
  useAuth: () => ({
    isLoaded: clerkState.isLoaded,
    isSignedIn: clerkState.isSignedIn,
    getToken: clerkState.getToken,
  }),
}))

const realEmptyReferralStatus: ReferralStatus = {
  code: null,
  threshold: 2,
  discountPercent: 50,
  qualifiedCount: 0,
  pendingCount: 0,
  remaining: 2,
  unlocked: false,
  unlockedAt: null,
  discountApplied: false,
  discountActive: false,
  hasActiveSubscription: false,
  referrals: [],
}

describe('useReferralStatus', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
    clerkState.isLoaded = true
    clerkState.isSignedIn = false
    clerkState.getToken = vi.fn(async () => null as string | null)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    globalThis.fetch = originalFetch
  })

  it('does not call the status API when signed out', async () => {
    clerkState.isSignedIn = false

    const { result } = renderHook(() => useReferralStatus())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.status).toBeNull()
    expect(result.current.error).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('loads the real empty referral-status shape with a bearer token', async () => {
    clerkState.isSignedIn = true
    clerkState.getToken = vi.fn(async () => 'convex-token')
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json(realEmptyReferralStatus),
    )

    const { result } = renderHook(() => useReferralStatus())

    await waitFor(() => {
      expect(result.current.status).toEqual(realEmptyReferralStatus)
    })
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(clerkState.getToken).toHaveBeenCalledWith({ template: 'convex' })
    expect(fetch).toHaveBeenCalledWith('/api/referrals/status', {
      headers: { Authorization: 'Bearer convex-token' },
    })
  })

  it('falls back to the server error message and supports manual reload', async () => {
    clerkState.isSignedIn = true
    clerkState.getToken = vi.fn(async () => 'convex-token')
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        Response.json(
          { error: 'Referral service unavailable.' },
          { status: 503 },
        ),
      )
      .mockResolvedValueOnce(Response.json(realEmptyReferralStatus))

    const { result } = renderHook(() => useReferralStatus())

    await waitFor(() => {
      expect(result.current.error).toBe('Referral service unavailable.')
    })

    await act(async () => {
      await result.current.reload()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.status).toEqual(realEmptyReferralStatus)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('surfaces a stable error when the referral status API returns malformed JSON', async () => {
    clerkState.isSignedIn = true
    clerkState.getToken = vi.fn(async () => 'convex-token')
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('<html>bad gateway</html>', {
        headers: { 'Content-Type': 'text/html' },
        status: 502,
      }),
    )

    const { result } = renderHook(() => useReferralStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.status).toBeNull()
    expect(result.current.error).toBe('Unable to load referrals.')
  })
})
