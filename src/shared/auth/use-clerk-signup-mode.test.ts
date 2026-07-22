// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useClerkSignUpMode } from './use-clerk-signup-mode'

const { mockClerkClientEnabled, clerkEnv } = vi.hoisted(() => ({
  mockClerkClientEnabled: { value: true },
  clerkEnv: {
    value: undefined as
      | {
          userSettings: {
            signUp: { mode: 'public' | 'restricted' | 'waitlist' }
          }
        }
      | undefined,
  },
}))

vi.mock('./clerk-runtime', () => ({
  isClerkClientEnabled: () => mockClerkClientEnabled.value,
}))

function setClerkEnvironment(
  mode: 'public' | 'restricted' | 'waitlist' | undefined,
) {
  if (mode === undefined) {
    clerkEnv.value = undefined
    delete (window as unknown as Record<string, unknown>).Clerk
  } else {
    clerkEnv.value = { userSettings: { signUp: { mode } } }
    ;(window as unknown as Record<string, unknown>).Clerk = {
      __internal_environment: clerkEnv.value,
      addListener: vi.fn(() => () => {}),
    }
  }
}

describe('useClerkSignUpMode', () => {
  beforeEach(() => {
    mockClerkClientEnabled.value = true
    setClerkEnvironment(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete (window as unknown as Record<string, unknown>).Clerk
    vi.useRealTimers()
  })

  it('returns undefined when Clerk environment is not loaded yet', () => {
    setClerkEnvironment(undefined)
    const { result } = renderHook(() => useClerkSignUpMode())
    expect(result.current).toBeUndefined()
  })

  it('returns the mode when Clerk environment is already available', () => {
    setClerkEnvironment('waitlist')
    const { result } = renderHook(() => useClerkSignUpMode())
    expect(result.current).toBe('waitlist')
  })

  it('returns "public" when waitlist is OFF', () => {
    setClerkEnvironment('public')
    const { result } = renderHook(() => useClerkSignUpMode())
    expect(result.current).toBe('public')
  })

  it('returns "restricted" when mode is restricted', () => {
    setClerkEnvironment('restricted')
    const { result } = renderHook(() => useClerkSignUpMode())
    expect(result.current).toBe('restricted')
  })

  it('updates when Clerk environment loads asynchronously', async () => {
    // Start with no environment
    setClerkEnvironment(undefined)
    const { result } = renderHook(() => useClerkSignUpMode())
    expect(result.current).toBeUndefined()

    // Simulate Clerk loading after a delay
    act(() => {
      setClerkEnvironment('public')
    })

    await waitFor(() => {
      expect(result.current).toBe('public')
    })
  })

  it('updates from waitlist to public when dashboard toggle is flipped', async () => {
    setClerkEnvironment('waitlist')
    const { result } = renderHook(() => useClerkSignUpMode())
    expect(result.current).toBe('waitlist')

    act(() => {
      setClerkEnvironment('public')
    })

    await waitFor(() => {
      expect(result.current).toBe('public')
    })
  })

  it('returns undefined when Clerk is not configured (disabled)', () => {
    mockClerkClientEnabled.value = false
    // In reality, window.Clerk won't exist when Clerk is disabled
    setClerkEnvironment(undefined)
    const { result } = renderHook(() => useClerkSignUpMode())
    expect(result.current).toBeUndefined()
  })
})
