// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clerkFrostedGlassAppearance } from '@/app/providers/clerk-appearance'
import { WaitlistGate } from './WaitlistGate'

const { mockAuth, capturedWaitlistProps, mockClerkClientEnabled } = vi.hoisted(
  () => ({
    mockAuth: {
      isLoaded: true,
      isSignedIn: false,
    },
    capturedWaitlistProps: {} as Record<string, unknown>,
    mockClerkClientEnabled: {
      value: true,
    },
  }),
)

vi.mock('@clerk/tanstack-react-start', () => ({
  Waitlist: (props: unknown) => {
    Object.assign(capturedWaitlistProps, props)
    return <div data-testid="clerk-waitlist">Join the waitlist</div>
  },
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => ({
    isLoaded: mockAuth.isLoaded,
    isSignedIn: mockAuth.isSignedIn,
    getToken: async () => null,
  }),
}))

vi.mock('@/shared/auth/clerk-runtime', () => ({
  isClerkClientEnabled: () => mockClerkClientEnabled.value,
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

describe('WaitlistGate', () => {
  afterEach(cleanup)

  describe('when signed out', () => {
    it('renders the Clerk Waitlist component', () => {
      setAuth(true, false)
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.getByTestId('clerk-waitlist')).toBeTruthy()
    })

    it('does not render children (prompt form)', () => {
      setAuth(true, false)
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.queryByTestId('prompt-form')).toBeNull()
    })

    it('passes afterJoinWaitlistUrl="/" to Waitlist', () => {
      setAuth(true, false)
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
      setAuth(true, false)
      for (const key of Object.keys(capturedWaitlistProps))
        delete capturedWaitlistProps[key]
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(capturedWaitlistProps).not.toHaveProperty('appearance')
    })

    it('renders children when client-side Clerk is disabled', () => {
      setAuth(true, false, false)
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.getByTestId('prompt-form')).toBeTruthy()
      expect(screen.queryByTestId('clerk-waitlist')).toBeNull()
    })
  })

  describe('when signed in', () => {
    it('renders children (prompt form)', () => {
      setAuth(true, true)
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.getByTestId('prompt-form')).toBeTruthy()
    })

    it('does not render the Waitlist component', () => {
      setAuth(true, true)
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.queryByTestId('clerk-waitlist')).toBeNull()
    })
  })

  describe('while auth is loading', () => {
    it('renders a loading spinner', () => {
      setAuth(false, false)
      const { container } = render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(container.querySelector('.animate-spin')).toBeTruthy()
    })

    it('does not render children or Waitlist', () => {
      setAuth(false, false)
      render(
        <WaitlistGate>
          <TestChildren />
        </WaitlistGate>,
      )
      expect(screen.queryByTestId('prompt-form')).toBeNull()
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
