// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { shouldUseAuthenticatedProviders } from '@/app/providers/provider-config'

// File-level mocks: ClerkProvider is surfaced as a marker so we can detect
// exactly where the real provider shell mounts; useAuth is stubbed for the
// ClerkConvexProvider path. ConvexProviderWithClerk is surfaced as a marker so
// we can assert ClerkConvexProvider wires Convex to Clerk (not a second
// ClerkProvider). The lazy-loaded ClerkConvexProvider module is mocked to a
// marker so AppProviders' lazy() import resolves synchronously in jsdom.
vi.mock('@clerk/tanstack-react-start', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
  useAuth: () => ({
    getToken: async () => 'token',
    isLoaded: true,
    isSignedIn: true,
  }),
}))

vi.mock('convex/react-clerk', () => ({
  ConvexProviderWithClerk: ({
    children,
  }: {
    children: React.ReactNode
    client: unknown
    useAuth: unknown
  }) => <div data-testid="convex-with-clerk">{children}</div>,
}))

vi.mock('convex/react', () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
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

vi.mock('@/shared/auth/useClaimAnonymousSessionsOnSignIn', () => ({
  useClaimAnonymousSessionsOnSignIn: () => {},
}))

vi.mock('sonner', () => ({
  Toaster: () => null,
}))

// Router mock: useRouterState feeds AppProviders a pathname; the remaining
// exports satisfy __root.tsx's imports so we can render the root component.
vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => unknown
  }) => select({ location: { pathname: '/generate/abc' } }),
  HeadContent: () => null,
  Scripts: () => null,
  Outlet: () => <div data-testid="outlet" />,
  createRootRoute: (opts: Record<string, unknown>) => ({ options: opts }),
}))

describe('app provider loading', () => {
  beforeAll(() => {
    // jsdom does not implement matchMedia; RootDocument's theme effect uses it.
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
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  describe('shouldUseAuthenticatedProviders', () => {
    it('returns true for the homepage, pricing, and generate routes', () => {
      expect(shouldUseAuthenticatedProviders('/')).toBe(true)
      expect(shouldUseAuthenticatedProviders('/pricing')).toBe(true)
      expect(shouldUseAuthenticatedProviders('/generate/abc')).toBe(true)
    })

    it('returns false for other routes', () => {
      expect(shouldUseAuthenticatedProviders('/dashboard')).toBe(false)
      expect(shouldUseAuthenticatedProviders('/blog/post')).toBe(false)
      expect(shouldUseAuthenticatedProviders('/sign-in')).toBe(false)
    })
  })

  describe('ClerkConvexProvider', () => {
    it('renders ConvexProviderWithClerk inside its own ClerkProvider', async () => {
      const { ClerkConvexProvider } =
        await import('@/app/providers/ClerkConvexProvider')
      render(
        <ClerkConvexProvider
          clerkPublishableKey="pk_test_dummy"
          convexUrl="https://example.test"
        >
          <div data-testid="child">child</div>
        </ClerkConvexProvider>,
      )
      expect(screen.getByTestId('convex-with-clerk')).toBeTruthy()
      expect(screen.getByTestId('child')).toBeTruthy()
      expect(screen.getByTestId('clerk-provider')).toBeTruthy()
    })
  })

  describe('AppProviders', () => {
    it('resolves the lazy ClerkConvexProvider import on authenticated routes', async () => {
      vi.stubEnv('VITE_CONVEX_URL', 'http://localhost:3001')
      const { AppProviders } = await import('@/app/providers/AppProviders')
      render(
        <AppProviders>
          <div data-testid="child">child</div>
        </AppProviders>,
      )
      // The lazy import resolves to the real ClerkConvexProvider, which wires
      // Convex to Clerk via ConvexProviderWithClerk (mocked marker).
      expect(await screen.findByTestId('convex-with-clerk')).toBeTruthy()
      expect(screen.getByTestId('child')).toBeTruthy()
    })
  })

  describe('root provider shell', () => {
    it('does not mount ClerkProvider in the root (Clerk is lazy-loaded via ClerkConvexProvider)', async () => {
      vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_dummy')
      const { Route } = await import('@/routes/__root')
      const RootComponent = Route.options.component as React.ComponentType
      render(<RootComponent />)
      // Clerk is deferred out of the root; it only mounts through the lazy
      // ClerkConvexProvider on authenticated routes, so the root shell itself
      // renders no ClerkProvider.
      expect(screen.queryByTestId('clerk-provider')).toBeNull()
    })
  })
})
