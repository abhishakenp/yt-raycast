// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clerkFrostedGlassAppearance } from '@/app/providers/clerk-appearance'
import { WaitlistGate } from './WaitlistGate'

const {
  mockAuth,
  capturedWaitlistProps,
  mockClerkClientEnabled,
  mockSignUpMode,
} = vi.hoisted(() => ({
  mockAuth: {
    isLoaded: true,
    isSignedIn: false,
  },
  capturedWaitlistProps: {} as Record<string, unknown>,
  mockClerkClientEnabled: {
    value: true,
  },
  mockSignUpMode: {
    value: 'waitlist' as 'public' | 'restricted' | 'waitlist' | undefined,
  },
}))

vi.mock('@clerk/tanstack-react-start', () => ({
  Waitlist: (props: unknown) => {
    Object.assign(capturedWaitlistProps, props)
    return <div data-testid="clerk-waitlist">Join the waitlist</div>
  },
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useIsAdmin: () => false,
  useOptionalAuth: () => ({
    isLoaded: mockAuth.isLoaded,
    isSignedIn: mockAuth.isSignedIn,
    getToken: async () => null,
  }),
}))

vi.mock('@/shared/auth/clerk-runtime', () => ({
  isClerkClientEnabled: () => mockClerkClientEnabled.value,
}))

vi.mock('@/shared/auth/use-clerk-signup-mode', () => ({
  useClerkSignUpMode: () => mockSignUpMode.value,
}))

const TestChildren = () => <div data-testid="prompt-form">Prompt form</div>

function setAuth(
  isLoaded: boolean,
  isSignedIn: boolean,
  clerkClientEnabled = true,
) {
  mockAuth.isLoaded = isLoaded
  mockAuth.isSignedIn = isSignedIn
  mockClerkClientEnabled.value = clerkClientEnabled
}

function setSignUpMode(mode: 'public' | 'restricted' | 'waitlist' | undefined) {
  mockSignUpMode.value = mode
}

describe('WaitlistGate', () => {
  afterEach(cleanup)

  describe('when signUp mode is waitlist and signed out', () => {
    beforeEach(() => {
      setAuth(true, false)
      setSignUpMode('waitlist')
    })

    it('renders the Clerk Waitlist component', () => {
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.getByTestId('clerk-waitlist')).toBeTruthy()
    })

    it('does not render children (prompt form)', () => {
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.queryByTestId('prompt-form')).toBeNull()
    })

    it('passes afterJoinWaitlistUrl="/" to Waitlist', () => {
      for (const key of Object.keys(capturedWaitlistProps))
        delete capturedWaitlistProps[key]
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(capturedWaitlistProps).toMatchObject({
        afterJoinWaitlistUrl: '/',
      })
    })

    it('does not pass a custom appearance prop to Waitlist', () => {
      for (const key of Object.keys(capturedWaitlistProps))
        delete capturedWaitlistProps[key]
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(capturedWaitlistProps).not.toHaveProperty('appearance')
    })
  })

  describe('when signUp mode is waitlist and signed in', () => {
    beforeEach(() => {
      setAuth(true, true)
      setSignUpMode('waitlist')
    })

    it('renders children (prompt form)', () => {
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.getByTestId('prompt-form')).toBeTruthy()
    })

    it('does not render the Waitlist component', () => {
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.queryByTestId('clerk-waitlist')).toBeNull()
    })
  })

  describe('when signUp mode is waitlist and auth is loading', () => {
    beforeEach(() => {
      setAuth(false, false)
      setSignUpMode('waitlist')
    })

    it('renders a loading spinner', () => {
      const { container } = render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(container.querySelector('.animate-spin')).toBeTruthy()
    })

    it('does not render children or Waitlist', () => {
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.queryByTestId('prompt-form')).toBeNull()
      expect(screen.queryByTestId('clerk-waitlist')).toBeNull()
    })
  })

  describe('when waitlist is OFF (signUp mode is public)', () => {
    beforeEach(() => {
      setAuth(true, false)
      setSignUpMode('public')
    })

    it('renders children (prompt form) even when signed out', () => {
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.getByTestId('prompt-form')).toBeTruthy()
    })

    it('does not render the Waitlist component', () => {
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.queryByTestId('clerk-waitlist')).toBeNull()
    })
  })

  describe('when waitlist is OFF (signUp mode is restricted)', () => {
    beforeEach(() => {
      setAuth(true, false)
      setSignUpMode('restricted')
    })

    it('renders children (prompt form) even when signed out', () => {
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.getByTestId('prompt-form')).toBeTruthy()
    })
  })

  describe('when signUp mode is unknown (SSR / Clerk loading)', () => {
    beforeEach(() => {
      setAuth(true, false)
      setSignUpMode(undefined)
    })

    it('renders a loading spinner', () => {
      const { container } = render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(container.querySelector('.animate-spin')).toBeTruthy()
    })

    it('does not render children or Waitlist', () => {
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.queryByTestId('prompt-form')).toBeNull()
      expect(screen.queryByTestId('clerk-waitlist')).toBeNull()
    })
  })

  describe('when Clerk is not configured', () => {
    beforeEach(() => {
      setAuth(true, false, false)
      setSignUpMode('waitlist')
    })

    it('renders children (prompt form)', () => {
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.getByTestId('prompt-form')).toBeTruthy()
      expect(screen.queryByTestId('clerk-waitlist')).toBeNull()
    })
  })
})

describe('clerkFrostedGlassAppearance waitlist override', () => {
  it('includes a waitlist component override', () => {
    expect(clerkFrostedGlassAppearance).toHaveProperty('waitlist')
  })

  it('makes the waitlist cardBox full-width', () => {
    const cardBox = (
      clerkFrostedGlassAppearance.waitlist as {
        elements: { cardBox: Record<string, string> }
      }
    ).elements.cardBox
    expect(cardBox.width).toBe('100%')
    expect(cardBox.maxWidth).toBe('none')
  })

  it('applies glassmorphic background to the waitlist cardBox', () => {
    const cardBox = (
      clerkFrostedGlassAppearance.waitlist as {
        elements: { cardBox: Record<string, string> }
      }
    ).elements.cardBox
    expect(cardBox.background).toContain('linear-gradient')
    expect(cardBox.backdropFilter).toContain('blur')
    expect(cardBox.borderRadius).toBe('26px')
  })

  it('applies cyan glow shadow matching the hero prompt card', () => {
    const cardBox = (
      clerkFrostedGlassAppearance.waitlist as {
        elements: { cardBox: Record<string, string> }
      }
    ).elements.cardBox
    expect(cardBox.boxShadow).toContain('38,231,255')
    expect(cardBox.border).toContain('38, 231, 255')
  })
})
