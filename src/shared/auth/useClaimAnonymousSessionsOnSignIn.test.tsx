// @vitest-environment jsdom
import { act, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const claimMocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  getReferralAuthToken: vi.fn(),
  isSignedIn: false,
  isLoaded: true,
}))

vi.mock('@/features/referrals/lib/referral-client', () => ({
  getReferralAuthToken: () => claimMocks.getReferralAuthToken(),
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => ({
    isSignedIn: claimMocks.isSignedIn,
    isLoaded: claimMocks.isLoaded,
    getToken: async () => null,
  }),
}))

import { useClaimAnonymousSessionsOnSignIn } from '@/shared/auth/useClaimAnonymousSessionsOnSignIn'

const Probe = () => {
  useClaimAnonymousSessionsOnSignIn()
  return null as unknown as ReactNode
}

describe('useClaimAnonymousSessionsOnSignIn', () => {
  beforeEach(() => {
    claimMocks.fetch.mockReset()
    claimMocks.fetch.mockResolvedValue(new Response('{}', { status: 200 }))
    claimMocks.getReferralAuthToken.mockReset()
    claimMocks.getReferralAuthToken.mockResolvedValue('jwt-token')
    claimMocks.isSignedIn = false
    claimMocks.isLoaded = true
    vi.stubGlobal('fetch', claimMocks.fetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('does not claim when not signed in', async () => {
    render(<Probe />)
    await waitFor(() => {
      expect(claimMocks.fetch).not.toHaveBeenCalled()
    })
  })

  it('does not claim while auth is still loading even if signed-in state is truthy', async () => {
    claimMocks.isLoaded = false
    claimMocks.isSignedIn = true

    render(<Probe />)

    await waitFor(() => {
      expect(claimMocks.fetch).not.toHaveBeenCalled()
    })
  })

  it('claims all anonymous sessions via the HTTP route when isSignedIn flips to true', async () => {
    claimMocks.isSignedIn = false
    const { rerender } = render(<Probe />)

    claimMocks.isSignedIn = true
    rerender(<Probe />)

    await waitFor(() => {
      expect(claimMocks.fetch).toHaveBeenCalledWith(
        '/api/claim-anon-sessions',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer jwt-token' },
        },
      )
    })
  })

  it('sends the request without an Authorization header when no token is available', async () => {
    claimMocks.getReferralAuthToken.mockResolvedValue(null)
    claimMocks.isSignedIn = true

    render(<Probe />)

    await waitFor(() => {
      expect(claimMocks.fetch).toHaveBeenCalledWith(
        '/api/claim-anon-sessions',
        {
          method: 'POST',
          headers: {},
        },
      )
    })
  })

  it('claims only once per sign-in transition and re-claims after sign-out then sign-in', async () => {
    claimMocks.isSignedIn = true
    const { rerender } = render(<Probe />)

    await waitFor(() => {
      expect(claimMocks.fetch).toHaveBeenCalledTimes(1)
    })

    // Re-render while still signed in — should NOT claim again.
    rerender(<Probe />)
    await waitFor(() => {
      expect(claimMocks.fetch).toHaveBeenCalledTimes(1)
    })

    // Sign out — resets the ref.
    claimMocks.isSignedIn = false
    rerender(<Probe />)
    await waitFor(() => {
      expect(claimMocks.fetch).toHaveBeenCalledTimes(1)
    })

    // Sign back in — claims again.
    claimMocks.isSignedIn = true
    act(() => {
      rerender(<Probe />)
    })

    await waitFor(() => {
      expect(claimMocks.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('swallows fetch errors', async () => {
    claimMocks.fetch.mockRejectedValue(new Error('network down'))
    claimMocks.isSignedIn = true

    // Should not throw.
    expect(() => render(<Probe />)).not.toThrow()

    await waitFor(() => {
      expect(claimMocks.fetch).toHaveBeenCalled()
    })
  })
})
