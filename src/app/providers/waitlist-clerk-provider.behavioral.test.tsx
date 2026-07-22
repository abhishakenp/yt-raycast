// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { createContext, useContext } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

// Reproduces the prod crash: "@clerk/react: Waitlist can only be used within
// the <ClerkProvider /> component." On `/` with Clerk enabled and the user not
// signed in, WaitlistGate renders <Waitlist />, which requires a ClerkProvider
// ancestor. Locally VITE_DISABLE_CLERK=true short-circuits WaitlistGate, so the
// bug only surfaces in prod. This test mocks ClerkProvider to publish a context
// flag and Waitlist to throw the real error when that flag is absent, then
// asserts the full AppProviders tree on `/` keeps Waitlist inside ClerkProvider.

const ClerkProviderContext = createContext(false)

const clerkProviderMounts = vi.hoisted(
  () => [] as Array<Record<string, unknown>>,
)

vi.mock('@clerk/tanstack-react-start', () => ({
  ClerkProvider: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    [key: string]: unknown
  }) => {
    clerkProviderMounts.push(props)
    return (
      <ClerkProviderContext.Provider value={true}>
        <div data-testid="clerk-provider">{children}</div>
      </ClerkProviderContext.Provider>
    )
  },
  useAuth: () => ({
    getToken: async () => null,
    isLoaded: true,
    isSignedIn: false,
  }),
  Waitlist: (props: { afterJoinWaitlistUrl?: string }) => {
    const inside = useContext(ClerkProviderContext)
    if (!inside) {
      throw new Error(
        'Waitlist can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider',
      )
    }
    return (
      <div data-testid="clerk-waitlist" data-url={props.afterJoinWaitlistUrl} />
    )
  },
}))

vi.mock('convex/react-clerk', () => ({
  ConvexProviderWithClerk: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-with-clerk">{children}</div>
  ),
}))

vi.mock('convex/react', () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-anonymous">{children}</div>
  ),
  ConvexReactClient: class {
    constructor() {}
  },
}))

vi.mock('@/shared/auth/clerk-runtime', () => ({
  getClerkPublishableKey: () => 'pk_test_dummy',
  isClerkClientEnabled: () => true,
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => ({
    getToken: async () => null,
    isLoaded: true,
    isSignedIn: false,
  }),
  openSignInEventName: 'ship-fast:open-sign-in',
}))

vi.mock('@/shared/auth/use-clerk-signup-mode', () => ({
  useClerkSignUpMode: () => 'waitlist',
}))

vi.mock('@/app/providers/clerk-appearance', () => ({
  clerkFrostedGlassAppearance: {},
}))

vi.mock('@/features/referrals/hooks/useReferralCapture', () => ({
  useReferralCapture: () => {},
}))

vi.mock('@/lib/chunk-load-recovery', () => ({
  installDynamicImportRecovery: () => () => {},
}))

vi.mock('@/shared/auth/useClaimAnonymousSessionsOnSignIn', () => ({
  useClaimAnonymousSessionsOnSignIn: () => {},
}))

vi.mock('@/components/launch-backdrop', () => ({
  LaunchBackdrop: () => <div data-testid="launch-backdrop" />,
}))

vi.mock('sonner', () => ({
  Toaster: () => null,
}))

const pathnameState = vi.hoisted(() => ({ value: '/' }))

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => unknown
  }) => select({ location: { pathname: pathnameState.value } }),
}))

describe('WaitlistGate inside AppProviders on / with Clerk enabled', () => {
  beforeAll(() => {
    if (!window.matchMedia) {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    }
  })

  afterEach(() => {
    cleanup()
    clerkProviderMounts.length = 0
    pathnameState.value = '/'
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('renders <Waitlist /> inside a ClerkProvider on / (repro for prod crash)', async () => {
    pathnameState.value = '/'
    vi.stubEnv('VITE_CONVEX_URL', 'http://localhost:3001')
    const { AppProviders } = await import('@/app/providers/AppProviders')
    const { WaitlistGate } =
      await import('@/features/home/components/WaitlistGate')

    // Must not throw "Waitlist can only be used within the <ClerkProvider />".
    expect(() =>
      render(
        <AppProviders>
          <WaitlistGate>
            <div data-testid="prompt-form">Prompt form</div>
          </WaitlistGate>
        </AppProviders>,
      ),
    ).not.toThrow()

    await waitFor(() =>
      expect(screen.getByTestId('clerk-waitlist')).toBeTruthy(),
    )
    expect(screen.getByTestId('clerk-waitlist').dataset.url).toBe('/')
    // Exactly one ClerkProvider mounts on / (SignInModalHost must not stack).
    expect(clerkProviderMounts.length).toBe(1)
    expect(screen.queryByTestId('prompt-form')).toBeNull()
  })

  it('does not stack a second ClerkProvider when the homepage TopActions mounts HomepageAuthControls', async () => {
    // Reproduces the "multiple <ClerkProvider>" prod crash: AppProviders mounts
    // ClerkConvexProvider on `/`, and HomePage's TopActions renders
    // <HomepageAuthControls wrapProvider={false}> inside it. If wrapProvider
    // defaults to true (or is omitted), a second ClerkProvider stacks.
    pathnameState.value = '/'
    vi.stubEnv('VITE_CONVEX_URL', 'http://localhost:3001')
    const { AppProviders } = await import('@/app/providers/AppProviders')
    const { HomepageAuthControls } =
      await import('@/components/HomepageAuthControls')

    render(
      <AppProviders>
        {/* Mirrors HomePage TopActions usage: wrapProvider={false} because
            AppProviders already mounted ClerkConvexProvider on `/`. */}
        <HomepageAuthControls renderButton wrapProvider={false} />
      </AppProviders>,
    )

    await waitFor(() =>
      expect(screen.getAllByTestId('clerk-provider').length).toBe(1),
    )
    expect(clerkProviderMounts.length).toBe(1)
  })
})
