// @vitest-environment jsdom
import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  getReferralAuthToken: vi.fn(),
  isSignedIn: false,
  isLoaded: true,
}))

vi.mock('@/features/referrals/lib/referral-client', () => ({
  getReferralAuthToken: () => mocks.getReferralAuthToken(),
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useIsAdmin: () => false,
  useOptionalAuth: () => ({
    isSignedIn: mocks.isSignedIn,
    isLoaded: mocks.isLoaded,
    getToken: async () => null,
  }),
}))

import { SyncSessions } from '@/shared/auth/SyncSessions'

describe('SyncSessions', () => {
  beforeEach(() => {
    mocks.fetch.mockReset()
    mocks.fetch.mockResolvedValue(new Response('{}', { status: 200 }))
    mocks.getReferralAuthToken.mockReset()
    mocks.getReferralAuthToken.mockResolvedValue('jwt-token')
    mocks.isSignedIn = false
    mocks.isLoaded = true
    vi.stubGlobal('fetch', mocks.fetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('renders nothing', () => {
    const { container } = render(<SyncSessions />)
    expect(container.firstChild).toBeNull()
  })

  it('does not fire claim when not signed in', async () => {
    render(<SyncSessions />)
    await waitFor(() => {
      expect(mocks.fetch).not.toHaveBeenCalled()
    })
  })

  it('does not fire while auth is still loading', async () => {
    mocks.isLoaded = false
    mocks.isSignedIn = true
    render(<SyncSessions />)
    await waitFor(() => {
      expect(mocks.fetch).not.toHaveBeenCalled()
    })
  })

  it('fires claim-by-IP API on mount when authenticated', async () => {
    mocks.isSignedIn = true
    render(<SyncSessions />)
    await waitFor(() => {
      expect(mocks.fetch).toHaveBeenCalledWith('/api/claim-anon-sessions', {
        method: 'POST',
        headers: { Authorization: 'Bearer jwt-token' },
      })
    })
  })

  it('sends request without Authorization header when no token available', async () => {
    mocks.getReferralAuthToken.mockResolvedValue(null)
    mocks.isSignedIn = true
    render(<SyncSessions />)
    await waitFor(() => {
      expect(mocks.fetch).toHaveBeenCalledWith('/api/claim-anon-sessions', {
        method: 'POST',
        headers: {},
      })
    })
  })

  it('fires only once per signed-in session', async () => {
    mocks.isSignedIn = true
    const { rerender } = render(<SyncSessions />)
    await waitFor(() => {
      expect(mocks.fetch).toHaveBeenCalledTimes(1)
    })
    rerender(<SyncSessions />)
    expect(mocks.fetch).toHaveBeenCalledTimes(1)
  })

  it('swallows fetch errors', async () => {
    mocks.fetch.mockRejectedValue(new Error('network down'))
    mocks.isSignedIn = true
    expect(() => render(<SyncSessions />)).not.toThrow()
    await waitFor(() => {
      expect(mocks.fetch).toHaveBeenCalled()
    })
  })
})
