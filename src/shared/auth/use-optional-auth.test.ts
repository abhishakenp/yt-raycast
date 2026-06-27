// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/tanstack-react-start', () => ({
  useAuth: vi.fn(),
  useClerk: vi.fn(),
}))

describe('useOptionalAuth', () => {
  afterEach(() => {
    cleanup()
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  // `isClerkConfigured` is a module-level build-time const read from
  // `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`, so each test stubs the env
  // value and dynamically re-imports the module to re-evaluate that const.
  async function loadHook(configured: boolean) {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', configured ? 'pk_test_abc' : '')
    const { useOptionalAuth } = await import('./use-optional-auth')
    const { useAuth } = await import('@clerk/tanstack-react-start')
    return { useOptionalAuth, useAuth: vi.mocked(useAuth) }
  }

  it('returns the mounted Clerk auth when authenticated', async () => {
    const getToken = vi.fn().mockResolvedValue('jwt-token')
    const { useOptionalAuth, useAuth } = await loadHook(true)
    useAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken,
    } as never)

    const { result } = renderHook(() => useOptionalAuth())

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.isSignedIn).toBe(true)
    expect(await result.current.getToken({ template: 'convex' })).toBe(
      'jwt-token',
    )
  })

  it('falls back to anonymous auth when Clerk is configured but not mounted', async () => {
    const { useOptionalAuth, useAuth } = await loadHook(true)
    useAuth.mockImplementation(() => {
      throw new Error('useAuth must be used within a ClerkProvider')
    })

    const { result } = renderHook(() => useOptionalAuth())

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.isSignedIn).toBe(false)
    expect(await result.current.getToken()).toBeNull()
  })

  it('falls back to the default Clerk token when the Convex JWT template is missing', async () => {
    const getToken = vi
      .fn()
      .mockImplementationOnce(async () => {
        throw new Error("No JWT template exists with name 'convex'")
      })
      .mockResolvedValue('default-token')
    const { useOptionalAuth, useAuth } = await loadHook(true)
    useAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken,
    } as never)

    const { result } = renderHook(() => useOptionalAuth())

    // The wrapped getToken catches the missing-template error from the first
    // (template-scoped) call and retries with no template, returning the
    // default token instead of propagating the error.
    expect(await result.current.getToken({ template: 'convex' })).toBe(
      'default-token',
    )
    expect(getToken).toHaveBeenNthCalledWith(1, { template: 'convex' })
    expect(getToken).toHaveBeenNthCalledWith(2)
  })
})
