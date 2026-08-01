// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

// Tracks every ClerkProvider mount so we can assert the provider tree contains
// exactly one ClerkProvider (Clerk throws "multiple <ClerkProvider>" otherwise).
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
    return <div data-testid="clerk-provider">{children}</div>
  },
  useAuth: () => ({
    getToken: async () => 'token',
    isLoaded: true,
    isSignedIn: false,
  }),
}))

vi.mock('convex/react-clerk', () => ({
  ConvexProviderWithClerk: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-with-clerk">{children}</div>
  ),
}))

vi.mock('convex/react', () => ({
  useQuery: () => ({ enabled: false }),
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

vi.mock('@/app/providers/clerk-appearance', () => ({
  clerkFrostedGlassAppearance: {},
}))

vi.mock('@/features/referrals/hooks/useReferralCapture', () => ({
  useReferralCapture: () => {},
}))

vi.mock('@/lib/chunk-load-recovery', () => ({
  installDynamicImportRecovery: () => () => {},
}))

vi.mock('@/shared/auth/SyncSessions', () => ({
  SyncSessions: () => null,
}))

vi.mock('@/components/launch-backdrop', () => ({
  LaunchBackdrop: () => <div data-testid="launch-backdrop" />,
}))

vi.mock('sonner', () => ({
  Toaster: () => null,
}))

const pathnameState = vi.hoisted(() => ({ value: '/generate/abc' }))

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => unknown
  }) => select({ location: { pathname: pathnameState.value } }),
}))

describe('ClerkProvider uniqueness across AppProviders + SignInModalHost', () => {
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
    pathnameState.value = '/generate/abc'
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('mounts exactly one ClerkProvider on an authenticated route when sign-in is requested', async () => {
    pathnameState.value = '/generate/abc'
    vi.stubEnv('VITE_CONVEX_URL', 'http://localhost:3001')
    const { openSignInEventName } =
      await import('@/shared/auth/use-optional-auth')
    const { AppProviders } = await import('@/app/providers/AppProviders')

    render(
      <AppProviders>
        <main>Dashboard</main>
      </AppProviders>,
    )

    // ClerkConvexProvider mounts the single ClerkProvider for the authed route.
    await waitFor(() =>
      expect(
        screen.getAllByTestId('clerk-provider').length,
      ).toBeGreaterThanOrEqual(1),
    )
    const baseline = screen.getAllByTestId('clerk-provider').length

    // Simulate a sign-in request (e.g. a gated dashboard control calling
    // requestClerkSignIn when window.Clerk.openSignIn is not yet available).
    window.dispatchEvent(new Event(openSignInEventName))

    // SignInModalHost must NOT stack a second ClerkProvider on authed routes.
    await waitFor(() => {
      expect(screen.getAllByTestId('clerk-provider').length).toBe(baseline)
    })
    // The DOM must contain exactly one ClerkProvider node.
    expect(screen.getAllByTestId('clerk-provider').length).toBe(1)
  })

  it('mounts exactly one ClerkProvider on the homepage and does not stack on sign-in', async () => {
    pathnameState.value = '/'
    vi.stubEnv('VITE_CONVEX_URL', 'http://localhost:3001')
    const { openSignInEventName } =
      await import('@/shared/auth/use-optional-auth')
    const { AppProviders } = await import('@/app/providers/AppProviders')

    render(
      <AppProviders>
        <main>Public home</main>
      </AppProviders>,
    )

    // `/` mounts ClerkConvexProvider from first paint so the homepage's
    // <Waitlist /> lives inside a ClerkProvider.
    await waitFor(() =>
      expect(screen.getAllByTestId('clerk-provider').length).toBe(1),
    )
    expect(screen.queryByTestId('convex-anonymous')).toBeNull()

    // Simulate a sign-in request: SignInModalHost must NOT stack a second
    // ClerkProvider on `/` (clerkMounted flag => wrapProvider={false}).
    window.dispatchEvent(new Event(openSignInEventName))

    await waitFor(() =>
      expect(screen.getAllByTestId('clerk-provider').length).toBe(1),
    )
  })
})
