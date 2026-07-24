// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SignInGate, useSignInGate } from './SignInGate'

const { mockAuth, mockClerk, mockClerkClientEnabled } = vi.hoisted(() => ({
  mockAuth: {
    isLoaded: true,
    isSignedIn: false,
  },
  mockClerk: {
    openSignIn: vi.fn(),
  },
  mockClerkClientEnabled: {
    value: true,
  },
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useIsAdmin: () => false,
  useOptionalAuth: () => ({
    isLoaded: mockAuth.isLoaded,
    isSignedIn: mockAuth.isSignedIn,
    getToken: async () => null,
  }),
  useOptionalClerk: () => mockClerk,
}))

vi.mock('@/shared/auth/clerk-runtime', () => ({
  isClerkClientEnabled: () => mockClerkClientEnabled.value,
}))

const RealItem = () => <div data-testid="real-item">real</div>
const LockedItem = () => <div data-testid="locked-item">locked</div>

function setAuth(
  isLoaded: boolean,
  isSignedIn: boolean,
  clerkClientEnabled = true,
) {
  mockAuth.isLoaded = isLoaded
  mockAuth.isSignedIn = isSignedIn
  mockClerkClientEnabled.value = clerkClientEnabled
}

afterEach(() => {
  cleanup()
  mockClerk.openSignIn.mockReset()
})

describe('SignInGate', () => {
  describe('when signed out', () => {
    it('renders the locked fallback', () => {
      setAuth(true, false)
      render(
        <SignInGate locked={<LockedItem />}>
          <RealItem />
        </SignInGate>,
      )
      expect(screen.getByTestId('locked-item')).toBeTruthy()
    })

    it('does not render children', () => {
      setAuth(true, false)
      render(
        <SignInGate locked={<LockedItem />}>
          <RealItem />
        </SignInGate>,
      )
      expect(screen.queryByTestId('real-item')).toBeNull()
    })
  })

  describe('when signed in', () => {
    it('renders children', () => {
      setAuth(true, true)
      render(
        <SignInGate locked={<LockedItem />}>
          <RealItem />
        </SignInGate>,
      )
      expect(screen.getByTestId('real-item')).toBeTruthy()
    })

    it('does not render the locked fallback', () => {
      setAuth(true, true)
      render(
        <SignInGate locked={<LockedItem />}>
          <RealItem />
        </SignInGate>,
      )
      expect(screen.queryByTestId('locked-item')).toBeNull()
    })
  })

  describe('while auth is loading', () => {
    it('renders the locked fallback (no flash of ungated UI)', () => {
      setAuth(false, false)
      render(
        <SignInGate locked={<LockedItem />}>
          <RealItem />
        </SignInGate>,
      )
      expect(screen.getByTestId('locked-item')).toBeTruthy()
      expect(screen.queryByTestId('real-item')).toBeNull()
    })
  })

  describe('when Clerk is disabled', () => {
    it('renders children (no-op gate)', () => {
      setAuth(true, false, false)
      render(
        <SignInGate locked={<LockedItem />}>
          <RealItem />
        </SignInGate>,
      )
      expect(screen.getByTestId('real-item')).toBeTruthy()
      expect(screen.queryByTestId('locked-item')).toBeNull()
    })
  })
})

describe('useSignInGate', () => {
  const Probe = ({
    onValue,
  }: {
    onValue: (v: ReturnType<typeof useSignInGate>) => void
  }) => {
    onValue(useSignInGate())
    return null
  }

  it('is gated when signed out + Clerk enabled', () => {
    setAuth(true, false)
    let value!: ReturnType<typeof useSignInGate>
    render(<Probe onValue={(v) => (value = v)} />)
    expect(value.isGated).toBe(true)
  })

  it('is not gated when signed in', () => {
    setAuth(true, true)
    let value!: ReturnType<typeof useSignInGate>
    render(<Probe onValue={(v) => (value = v)} />)
    expect(value.isGated).toBe(false)
  })

  it('is not gated when Clerk is disabled', () => {
    setAuth(true, false, false)
    let value!: ReturnType<typeof useSignInGate>
    render(<Probe onValue={(v) => (value = v)} />)
    expect(value.isGated).toBe(false)
  })

  it('requireSignIn opens the sign-in modal and returns false when gated', () => {
    setAuth(true, false)
    let value!: ReturnType<typeof useSignInGate>
    render(<Probe onValue={(v) => (value = v)} />)
    let result = true
    act(() => {
      result = value.requireSignIn()
    })
    expect(result).toBe(false)
    expect(mockClerk.openSignIn).toHaveBeenCalledTimes(1)
  })

  it('requireSignIn returns true and does not open the modal when not gated', () => {
    setAuth(true, true)
    let value!: ReturnType<typeof useSignInGate>
    render(<Probe onValue={(v) => (value = v)} />)
    let result = false
    act(() => {
      result = value.requireSignIn()
    })
    expect(result).toBe(true)
    expect(mockClerk.openSignIn).not.toHaveBeenCalled()
  })

  it('requireSignIn is a no-op when Clerk is disabled', () => {
    setAuth(true, false, false)
    let value!: ReturnType<typeof useSignInGate>
    render(<Probe onValue={(v) => (value = v)} />)
    let result = false
    act(() => {
      result = value.requireSignIn()
    })
    expect(result).toBe(true)
    expect(mockClerk.openSignIn).not.toHaveBeenCalled()
  })
})
