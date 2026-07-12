// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const importOptionalAuth = async () => {
  vi.resetModules()
  return await import('@/shared/auth/use-optional-auth')
}

function setClerk(clerk: unknown) {
  ;(window as Window & { Clerk?: unknown }).Clerk = clerk
}

describe('useOptionalAuth', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    delete (window as Window & { Clerk?: unknown }).Clerk
  })

  it('stays anonymous and does not open Clerk when no publishable key is configured', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '')
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', '')
    const openSignIn = vi.fn()
    const dispatched: string[] = []
    setClerk({
      openSignIn,
      session: {
        getToken: vi.fn(async () => 'should-not-be-used'),
      },
      user: { id: 'user_123' },
    })
    window.addEventListener('ship-fast:open-sign-in', () => {
      dispatched.push('ship-fast:open-sign-in')
    })

    const { requestClerkSignIn, useOptionalAuth } = await importOptionalAuth()
    const { result } = renderHook(() => useOptionalAuth())

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.isSignedIn).toBe(false)
    await expect(result.current.getToken({ template: 'convex' })).resolves.toBe(
      null,
    )

    requestClerkSignIn()

    expect(openSignIn).not.toHaveBeenCalled()
    expect(dispatched).toEqual([])
  })

  it('falls back to the default Clerk token when the Convex JWT template is missing', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_optional_auth')
    const getToken = vi
      .fn()
      .mockRejectedValueOnce(
        new Error('No JWT template exists with name convex'),
      )
      .mockResolvedValueOnce('default-clerk-token')
    const unsubscribe = vi.fn()
    setClerk({
      addListener: vi.fn(() => unsubscribe),
      session: { getToken },
      user: { id: 'user_123' },
    })

    const { useOptionalAuth } = await importOptionalAuth()
    const { result, unmount } = renderHook(() => useOptionalAuth())

    expect(result.current.isSignedIn).toBe(true)
    await expect(result.current.getToken({ template: 'convex' })).resolves.toBe(
      'default-clerk-token',
    )
    expect(getToken).toHaveBeenNthCalledWith(1, { template: 'convex' })
    expect(getToken).toHaveBeenNthCalledWith(2)

    await act(async () => {
      unmount()
    })
    expect(unsubscribe).toHaveBeenCalled()
  })

  it('dispatches the app sign-in event when Clerk is configured but not mounted with openSignIn', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_optional_auth')
    setClerk({ session: null, user: null })
    const dispatched: string[] = []
    window.addEventListener('ship-fast:open-sign-in', (event) => {
      dispatched.push(event.type)
    })

    const { requestClerkSignIn } = await importOptionalAuth()

    requestClerkSignIn()

    expect(dispatched).toEqual(['ship-fast:open-sign-in'])
  })

  it('exposes Clerk profile actions and falls back to sign-in when profile UI is unavailable', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_optional_auth')
    const openUserProfile = vi.fn()
    const openSignIn = vi.fn()
    setClerk({
      addListener: vi.fn(),
      openSignIn,
      openUserProfile,
      session: { getToken: vi.fn() },
      user: { id: 'user_123' },
    })
    const { useOptionalClerk } = await importOptionalAuth()
    const { result, rerender } = renderHook(() => useOptionalClerk())

    result.current.openUserProfile()
    expect(openUserProfile).toHaveBeenCalledTimes(1)
    expect(openSignIn).not.toHaveBeenCalled()

    setClerk({
      addListener: vi.fn(),
      openSignIn,
      session: { getToken: vi.fn() },
      user: { id: 'user_123' },
    })
    rerender()

    result.current.openUserProfile()
    expect(openSignIn).toHaveBeenCalledTimes(1)
  })
})
