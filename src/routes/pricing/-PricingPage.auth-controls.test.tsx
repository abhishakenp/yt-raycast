// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

type LinkMockProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  children?: ReactNode
  preload?: string
  to: string
}

type ShowMockProps = {
  children?: ReactNode
  when: 'signed-in' | 'signed-out'
}

const pricingAuthMocks = vi.hoisted(() => ({
  authControls: vi.fn(
    ({
      renderButton = true,
    }: {
      autoOpen?: boolean
      renderButton?: boolean
      wrapProvider?: boolean
    }) =>
      renderButton ? (
        <button type="button">Sign in</button>
      ) : (
        <div data-testid="homepage-auth-controls" />
      ),
  ),
  getToken: vi.fn(),
  preloadRoute: vi.fn(async () => undefined),
  requestClerkSignIn: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, preload, to, ...props }: LinkMockProps) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({
    preloadRoute: pricingAuthMocks.preloadRoute,
  }),
}))

vi.mock('@clerk/tanstack-react-start', () => ({
  Show: ({ children, when }: ShowMockProps) =>
    when === 'signed-out' ? <>{children}</> : null,
  SignInButton: ({ children }: { children?: ReactNode }) => <>{children}</>,
  UserButton: () => <span>Account</span>,
}))

vi.mock('@/components/HomepageAuthControls', () => ({
  HomepageAuthControls: pricingAuthMocks.authControls,
}))

vi.mock('@/features/partners/lib/partner-config', () => ({
  isPartnerProgramClientEnabled: () => false,
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useIsAdmin: () => false,
  requestClerkSignIn: pricingAuthMocks.requestClerkSignIn,
  useOptionalAuth: () => ({ getToken: pricingAuthMocks.getToken }),
}))

vi.mock('@/features/referrals/hooks/useReferralCode', () => ({
  useReferralCode: () => ({ code: null, isLoading: false }),
}))

describe('PricingPage auth controls', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
    vi.resetModules()
    pricingAuthMocks.authControls.mockClear()
    pricingAuthMocks.getToken.mockReset()
    pricingAuthMocks.preloadRoute.mockClear()
    pricingAuthMocks.requestClerkSignIn.mockClear()
  })

  it('renders only one visible sign-in button in the pricing shell', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', '')
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_pricing')
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', '')
    pricingAuthMocks.getToken.mockResolvedValue(null)

    const { PricingPage } = await import('./-PricingPage')

    render(<PricingPage />)

    await waitFor(() =>
      expect(screen.getByTestId('homepage-auth-controls')).toBeTruthy(),
    )

    expect(screen.getAllByRole('button', { name: /sign in/i })).toHaveLength(1)
    expect(pricingAuthMocks.authControls).toHaveBeenCalledWith(
      expect.objectContaining({ renderButton: false, wrapProvider: false }),
      undefined,
    )
  })
})
