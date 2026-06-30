// @vitest-environment jsdom
import { act, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const claimMocks = vi.hoisted(() => ({
  claimAnonymousSessions: vi.fn(),
  isSignedIn: false,
  isLoaded: true,
}))

vi.mock('convex/react', () => ({
  useMutation: () => claimMocks.claimAnonymousSessions,
}))

vi.mock('../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      claimAnonymousSessionsByClientIdMutation:
        'sessions.claimAnonymousSessionsByClientIdMutation',
    },
  },
}))

vi.mock('@/features/session/services/session-create-payload', () => ({
  createAnonymousClientId: (storage: Storage) =>
    storage.getItem('ship-fast-anon-client-id') ?? 'anon-claim-test',
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
    claimMocks.claimAnonymousSessions.mockReset()
    claimMocks.claimAnonymousSessions.mockResolvedValue({ claimed: 0 })
    claimMocks.isSignedIn = false
    claimMocks.isLoaded = true
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not claim when not signed in', async () => {
    render(<Probe />)
    await waitFor(() => {
      expect(claimMocks.claimAnonymousSessions).not.toHaveBeenCalled()
    })
  })

  it('claims all anonymous sessions when isSignedIn flips to true', async () => {
    claimMocks.isSignedIn = false
    const { rerender } = render(<Probe />)

    claimMocks.isSignedIn = true
    rerender(<Probe />)

    await waitFor(() => {
      expect(claimMocks.claimAnonymousSessions).toHaveBeenCalledWith({
        anonymousClientId: 'anon-claim-test',
      })
    })
  })

  it('claims only once per sign-in transition and re-claims after sign-out then sign-in', async () => {
    claimMocks.isSignedIn = true
    const { rerender } = render(<Probe />)

    await waitFor(() => {
      expect(claimMocks.claimAnonymousSessions).toHaveBeenCalledTimes(1)
    })

    // Re-render while still signed in — should NOT claim again.
    rerender(<Probe />)
    await waitFor(() => {
      expect(claimMocks.claimAnonymousSessions).toHaveBeenCalledTimes(1)
    })

    // Sign out — resets the ref.
    claimMocks.isSignedIn = false
    rerender(<Probe />)
    await waitFor(() => {
      expect(claimMocks.claimAnonymousSessions).toHaveBeenCalledTimes(1)
    })

    // Sign back in — claims again.
    claimMocks.isSignedIn = true
    act(() => {
      rerender(<Probe />)
    })

    await waitFor(() => {
      expect(claimMocks.claimAnonymousSessions).toHaveBeenCalledTimes(2)
    })
  })

  it('swallows claim mutation errors', async () => {
    claimMocks.claimAnonymousSessions.mockRejectedValue(
      new Error('network down'),
    )
    claimMocks.isSignedIn = true

    // Should not throw.
    expect(() => render(<Probe />)).not.toThrow()

    await waitFor(() => {
      expect(claimMocks.claimAnonymousSessions).toHaveBeenCalled()
    })
  })
})
