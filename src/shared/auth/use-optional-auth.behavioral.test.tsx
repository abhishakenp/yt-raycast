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

  it('does not open Clerk sign-in when a single-session user is already signed in', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_optional_auth')
    const openSignIn = vi.fn()
    const dispatched: string[] = []
    setClerk({
      openSignIn,
      session: { getToken: vi.fn() },
      user: { id: 'user_123' },
    })
    window.addEventListener('ship-fast:open-sign-in', (event) => {
      dispatched.push(event.type)
    })

    const { requestClerkSignIn } = await importOptionalAuth()

    requestClerkSignIn()

    expect(openSignIn).not.toHaveBeenCalled()
    expect(dispatched).toEqual([])
  })

  it('exposes Clerk profile actions without opening sign-in for signed-in users', async () => {
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
    expect(openSignIn).not.toHaveBeenCalled()
  })
})

describe('useIsAdmin', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    delete (window as Window & { Clerk?: unknown }).Clerk
  })

  it('returns true when publicMetadata.system_role is admin', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_admin_role')
    setClerk({
      addListener: vi.fn(),
      session: { getToken: vi.fn() },
      user: { id: 'user_admin', publicMetadata: { system_role: 'admin' } },
    })
    const { useIsAdmin } = await importOptionalAuth()
    const { result } = renderHook(() => useIsAdmin())
    expect(result.current).toBe(true)
  })

  it('returns true when publicMetadata.systemRole (camelCase) is admin', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_admin_role')
    setClerk({
      addListener: vi.fn(),
      session: { getToken: vi.fn() },
      user: { id: 'user_admin', publicMetadata: { systemRole: 'admin' } },
    })
    const { useIsAdmin } = await importOptionalAuth()
    const { result } = renderHook(() => useIsAdmin())
    expect(result.current).toBe(true)
  })

  it('returns false when publicMetadata has no admin role', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_admin_role')
    setClerk({
      addListener: vi.fn(),
      session: { getToken: vi.fn() },
      user: { id: 'user_normal', publicMetadata: { system_role: 'user' } },
    })
    const { useIsAdmin } = await importOptionalAuth()
    const { result } = renderHook(() => useIsAdmin())
    expect(result.current).toBe(false)
  })

  it('returns false when no user is signed in', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_admin_role')
    setClerk({ addListener: vi.fn(), session: null, user: null })
    const { useIsAdmin } = await importOptionalAuth()
    const { result } = renderHook(() => useIsAdmin())
    expect(result.current).toBe(false)
  })

  it('returns true when Clerk is disabled, treating everyone as a super admin', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', 'true')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_ignored')
    setClerk({ addListener: vi.fn(), session: null, user: null })
    const { useIsAdmin } = await importOptionalAuth()
    const { result } = renderHook(() => useIsAdmin())
    expect(result.current).toBe(true)
  })
})

describe('isCurrentUserAdmin', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    delete (window as Window & { Clerk?: unknown }).Clerk
  })

  it('returns true synchronously when the signed-in user is an admin', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_admin_role')
    setClerk({
      addListener: vi.fn(),
      session: { getToken: vi.fn() },
      user: { id: 'user_admin', publicMetadata: { system_role: 'admin' } },
    })
    const { isCurrentUserAdmin } = await importOptionalAuth()
    expect(isCurrentUserAdmin()).toBe(true)
  })

  it('returns false synchronously for a non-admin user', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_admin_role')
    setClerk({
      addListener: vi.fn(),
      session: { getToken: vi.fn() },
      user: { id: 'user_normal', publicMetadata: { system_role: 'user' } },
    })
    const { isCurrentUserAdmin } = await importOptionalAuth()
    expect(isCurrentUserAdmin()).toBe(false)
  })

  it('returns true when Clerk is disabled, treating everyone as a super admin', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', 'true')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_ignored')
    setClerk({
      addListener: vi.fn(),
      session: { getToken: vi.fn() },
      user: { id: 'user_admin', publicMetadata: { system_role: 'admin' } },
    })
    const { isCurrentUserAdmin } = await importOptionalAuth()
    expect(isCurrentUserAdmin()).toBe(true)
  })
})
