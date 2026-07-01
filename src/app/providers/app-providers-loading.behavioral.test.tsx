// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { shouldUseAuthenticatedProviders } from '@/app/providers/provider-config'

const appProviderMocks = vi.hoisted(() => ({
  clerkPublishableKey: 'pk_test_dummy' as string | undefined,
  claimAnonymousSessionsOnSignIn: vi.fn(),
  clerkProviderProps: [] as Array<Record<string, unknown>>,
  convexClients: [] as Array<{ options: unknown; url: string }>,
  convexWithClerkProps: [] as Array<{ client: unknown; useAuth: unknown }>,
  pathname: '/generate/abc',
}))

// File-level mocks: ClerkProvider is surfaced as a marker so we can detect
// exactly where the real provider shell mounts; useAuth is stubbed for the
// ClerkConvexProvider path. ConvexProviderWithClerk is surfaced as a marker so
// we can assert ClerkConvexProvider wires Convex to Clerk (not a second
// ClerkProvider). The lazy-loaded ClerkConvexProvider module is mocked to a
// marker so AppProviders' lazy() import resolves synchronously in jsdom.
vi.mock('@clerk/tanstack-react-start', () => ({
  ClerkProvider: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    [key: string]: unknown
  }) => {
    appProviderMocks.clerkProviderProps.push(props)
    return <div data-testid="clerk-provider">{children}</div>
  },
  useAuth: () => ({
    getToken: async () => 'token',
    isLoaded: true,
    isSignedIn: true,
  }),
}))

vi.mock('convex/react-clerk', () => ({
  ConvexProviderWithClerk: ({
    children,
    client,
    useAuth,
  }: {
    children: React.ReactNode
    client: unknown
    useAuth: unknown
  }) => {
    appProviderMocks.convexWithClerkProps.push({ client, useAuth })
    return <div data-testid="convex-with-clerk">{children}</div>
  },
}))

vi.mock('convex/react', () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-anonymous">{children}</div>
  ),
  ConvexReactClient: class {
    constructor(url: string, options: unknown) {
      appProviderMocks.convexClients.push({ url, options })
    }
  },
}))

vi.mock('@/shared/auth/clerk-runtime', () => ({
  getClerkPublishableKey: () => appProviderMocks.clerkPublishableKey,
  isClerkClientEnabled: () => true,
}))

vi.mock('@/app/providers/clerk-appearance', () => ({
  clerkFrostedGlassAppearance: {},
}))

vi.mock('@/app/providers/SignInModalHost', () => ({
  SignInModalHost: ({ requestId }: { requestId: number }) => (
    <div data-testid="sign-in-modal-host">request {requestId}</div>
  ),
}))

vi.mock('@/components/launch-backdrop', () => ({
  LaunchBackdrop: () => <div data-testid="launch-backdrop" />,
}))

vi.mock('@/features/referrals/hooks/useReferralCapture', () => ({
  useReferralCapture: () => {},
}))

vi.mock('@/lib/chunk-load-recovery', () => ({
  installDynamicImportRecovery: () => () => {},
}))

vi.mock('@/shared/auth/useClaimAnonymousSessionsOnSignIn', () => ({
  useClaimAnonymousSessionsOnSignIn:
    appProviderMocks.claimAnonymousSessionsOnSignIn,
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
  }) => select({ location: { pathname: appProviderMocks.pathname } }),
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
    appProviderMocks.clerkPublishableKey = 'pk_test_dummy'
    appProviderMocks.claimAnonymousSessionsOnSignIn.mockClear()
    appProviderMocks.clerkProviderProps.length = 0
    appProviderMocks.convexClients.length = 0
    appProviderMocks.convexWithClerkProps.length = 0
    appProviderMocks.pathname = '/generate/abc'
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

    it('passes runtime auth, Convex, and anonymous-claiming contracts to the provider tree', async () => {
      const { ClerkConvexProvider } =
        await import('@/app/providers/ClerkConvexProvider')

      render(
        <ClerkConvexProvider
          clerkPublishableKey="pk_live_real"
          convexUrl="https://convex-live.example.test"
        >
          <div data-testid="child">child</div>
        </ClerkConvexProvider>,
      )

      expect(appProviderMocks.clerkProviderProps).toHaveLength(1)
      expect(appProviderMocks.clerkProviderProps[0]).toMatchObject({
        afterSignOutUrl: '/',
        appearance: {},
        publishableKey: 'pk_live_real',
      })
      expect(appProviderMocks.convexClients).toEqual([
        {
          options: { logger: false },
          url: 'https://convex-live.example.test',
        },
      ])
      expect(appProviderMocks.convexWithClerkProps).toEqual([
        {
          client: expect.any(Object),
          useAuth: expect.any(Function),
        },
      ])
      expect(
        appProviderMocks.claimAnonymousSessionsOnSignIn,
      ).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('child')).toBeTruthy()
    })

    it('reuses the Clerk-backed Convex client until the Convex URL changes', async () => {
      const { ClerkConvexProvider } =
        await import('@/app/providers/ClerkConvexProvider')
      const { rerender } = render(
        <ClerkConvexProvider
          clerkPublishableKey="pk_live_real"
          convexUrl="https://first-convex.example.test"
        >
          <div data-testid="child">first child</div>
        </ClerkConvexProvider>,
      )

      rerender(
        <ClerkConvexProvider
          clerkPublishableKey="pk_live_real"
          convexUrl="https://first-convex.example.test"
        >
          <div data-testid="child">second child</div>
        </ClerkConvexProvider>,
      )

      expect(screen.getByText('second child')).toBeTruthy()
      expect(appProviderMocks.convexClients).toHaveLength(1)

      rerender(
        <ClerkConvexProvider
          clerkPublishableKey="pk_live_real"
          convexUrl="https://second-convex.example.test"
        >
          <div data-testid="child">third child</div>
        </ClerkConvexProvider>,
      )

      expect(screen.getByText('third child')).toBeTruthy()
      expect(
        appProviderMocks.convexClients.map((client) => client.url),
      ).toEqual([
        'https://first-convex.example.test',
        'https://second-convex.example.test',
      ])
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

    it('shows the public launch backdrop on the homepage without loading Convex providers', async () => {
      appProviderMocks.pathname = '/'
      vi.stubEnv('VITE_CONVEX_URL', 'http://localhost:3001')
      const { AppProviders } = await import('@/app/providers/AppProviders')

      render(
        <AppProviders>
          <main>Public home</main>
        </AppProviders>,
      )

      expect(await screen.findByTestId('launch-backdrop')).toBeTruthy()
      expect(screen.getByText('Public home')).toBeTruthy()
      expect(screen.queryByTestId('convex-with-clerk')).toBeNull()
      expect(screen.queryByTestId('convex-anonymous')).toBeNull()
    })

    it('loads anonymous Convex on generate routes when Clerk is not configured', async () => {
      appProviderMocks.clerkPublishableKey = undefined
      appProviderMocks.pathname = '/generate/anonymous-session'
      vi.stubEnv('VITE_CONVEX_URL', 'http://localhost:3001')
      const { AppProviders } = await import('@/app/providers/AppProviders')

      render(
        <AppProviders>
          <main>Anonymous generation</main>
        </AppProviders>,
      )

      expect(await screen.findByTestId('convex-anonymous')).toBeTruthy()
      expect(screen.getByText('Anonymous generation')).toBeTruthy()
      expect(screen.queryByTestId('convex-with-clerk')).toBeNull()
      expect(screen.queryByTestId('clerk-provider')).toBeNull()
    })

    it('loads anonymous Convex on gallery routes that render Convex hook consumers', async () => {
      appProviderMocks.pathname = '/gallery'
      vi.stubEnv('VITE_CONVEX_URL', 'http://localhost:3001')
      const { AppProviders } = await import('@/app/providers/AppProviders')

      const { rerender } = render(
        <AppProviders>
          <main>Gallery page</main>
        </AppProviders>,
      )

      expect(await screen.findByTestId('convex-anonymous')).toBeTruthy()
      expect(screen.getByText('Gallery page')).toBeTruthy()
      expect(screen.queryByTestId('convex-with-clerk')).toBeNull()
      expect(screen.queryByTestId('clerk-provider')).toBeNull()

      appProviderMocks.pathname = '/mine'
      rerender(
        <AppProviders>
          <main>Mine page</main>
        </AppProviders>,
      )

      expect(await screen.findByTestId('convex-anonymous')).toBeTruthy()
      expect(screen.getByText('Mine page')).toBeTruthy()
      expect(screen.queryByTestId('convex-with-clerk')).toBeNull()
      expect(screen.queryByTestId('clerk-provider')).toBeNull()
    })

    it('does not mount generation route children outside Convex when Convex is not configured', async () => {
      appProviderMocks.pathname = '/generate/session-without-convex-url'
      vi.stubEnv('VITE_CONVEX_SELF_HOSTED_URL', '')
      vi.stubEnv('VITE_CONVEX_URL', '')
      vi.stubEnv('CONVEX_SELF_HOSTED_URL', '')
      vi.stubEnv('CONVEX_URL', '')
      const { AppProviders } = await import('@/app/providers/AppProviders')

      render(
        <AppProviders>
          <main>Generation workspace that calls Convex hooks</main>
        </AppProviders>,
      )

      expect(
        screen.queryByText('Generation workspace that calls Convex hooks'),
      ).toBeNull()
      expect(screen.queryByTestId('convex-anonymous')).toBeNull()
      expect(screen.queryByTestId('convex-with-clerk')).toBeNull()
    })

    it('prevents Convex hook consumers from crashing on real generate, gallery, and mine routes when Convex is unconfigured', async () => {
      vi.stubEnv('VITE_CONVEX_SELF_HOSTED_URL', '')
      vi.stubEnv('VITE_CONVEX_URL', '')
      vi.stubEnv('CONVEX_SELF_HOSTED_URL', '')
      vi.stubEnv('CONVEX_URL', '')
      const { AppProviders } = await import('@/app/providers/AppProviders')
      const ConvexHookConsumer = () => {
        throw new Error(
          'Could not find Convex client! `useQuery` must be used in the React component tree under `ConvexProvider`.',
        )
      }

      for (const pathname of [
        '/generate/k574ms14ma9f94keq30r7dq24x89n1k2',
        '/gallery',
        '/mine',
      ]) {
        cleanup()
        appProviderMocks.pathname = pathname

        expect(() =>
          render(
            <AppProviders>
              <ConvexHookConsumer />
            </AppProviders>,
          ),
        ).not.toThrow()
        expect(screen.queryByTestId('convex-anonymous')).toBeNull()
        expect(screen.queryByTestId('convex-with-clerk')).toBeNull()
        expect(screen.queryByLabelText('Loading secure workspace')).toBeTruthy()
      }
    })

    it('mounts the sign-in host only after the global sign-in event fires', async () => {
      appProviderMocks.pathname = '/'
      const { openSignInEventName } =
        await import('@/shared/auth/use-optional-auth')
      const { AppProviders } = await import('@/app/providers/AppProviders')

      render(
        <AppProviders>
          <main>Public home</main>
        </AppProviders>,
      )

      expect(screen.queryByTestId('sign-in-modal-host')).toBeNull()

      window.dispatchEvent(new Event(openSignInEventName))

      expect(
        (await screen.findByTestId('sign-in-modal-host')).textContent,
      ).toBe('request 1')
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
