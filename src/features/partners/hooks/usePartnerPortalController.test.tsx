// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { usePartnerPortalController } from './usePartnerPortalController'

const mocks = vi.hoisted(() => ({
  axiosGet: vi.fn(),
  auth: {
    getToken: vi.fn(),
    isLoaded: true,
    isSignedIn: false,
  },
  requestSignIn: vi.fn(),
}))

vi.mock('axios', () => ({
  default: { get: mocks.axiosGet },
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useIsAdmin: () => false,
  requestClerkSignIn: mocks.requestSignIn,
  useOptionalAuth: () => mocks.auth,
}))

describe('usePartnerPortalController', () => {
  beforeEach(() => {
    mocks.axiosGet.mockReset()
    mocks.auth.getToken.mockReset()
    mocks.auth.isSignedIn = false
    mocks.requestSignIn.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('does not request a token while disabled or signed out', () => {
    const disabled = renderHook(() =>
      usePartnerPortalController({ enabled: false }),
    )
    expect(disabled.result.current.status).toBe('unavailable')
    disabled.unmount()

    const signedOut = renderHook(() =>
      usePartnerPortalController({ enabled: true }),
    )
    expect(signedOut.result.current.status).toBe('signed_out')
    expect(mocks.axiosGet).not.toHaveBeenCalled()
  })

  it('loads the embed token with a Convex bearer token', async () => {
    mocks.auth.isSignedIn = true
    mocks.auth.getToken.mockResolvedValue('convex-token')
    mocks.axiosGet.mockResolvedValueOnce({
      data: { publicToken: 'dub_public_token' },
    })

    const view = renderHook(() => usePartnerPortalController({ enabled: true }))

    await waitFor(() => expect(view.result.current.status).toBe('ready'))
    expect(view.result.current.publicToken).toBe('dub_public_token')
    expect(mocks.auth.getToken).toHaveBeenCalledWith({ template: 'convex' })
    expect(mocks.axiosGet).toHaveBeenCalledWith('/api/partners/embed-token', {
      headers: { Authorization: 'Bearer convex-token' },
    })
  })

  it('returns a retryable error when token loading fails', async () => {
    mocks.auth.isSignedIn = true
    mocks.auth.getToken.mockResolvedValue('convex-token')
    mocks.axiosGet.mockRejectedValueOnce(new Error('service unavailable'))

    const view = renderHook(() => usePartnerPortalController({ enabled: true }))

    await waitFor(() => expect(view.result.current.status).toBe('error'))
    act(() => view.result.current.retry())
    await waitFor(() => expect(mocks.axiosGet).toHaveBeenCalledTimes(2))
  })
})
