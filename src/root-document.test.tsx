// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const rootMocks = vi.hoisted(() => ({
  claimOnSignIn: vi.fn(),
  installDynamicImportRecovery: vi.fn(() => vi.fn()),
  useReferralCapture: vi.fn(),
}))

// Stub the root's heavy dependencies so we can render the root component and
// its not-found component behaviorally. ClerkProvider is surfaced as a marker;
// the router primitives are no-ops; AppProviders is a passthrough so the root
// tree mounts without a backend.
vi.mock('@clerk/tanstack-react-start', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
}))

vi.mock('@/app/providers/AppProviders', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/app/providers/clerk-appearance', () => ({
  clerkFrostedGlassAppearance: {},
}))

vi.mock('@/features/referrals/hooks/useReferralCapture', () => ({
  useReferralCapture: rootMocks.useReferralCapture,
}))

vi.mock('@/lib/chunk-load-recovery', () => ({
  installDynamicImportRecovery: rootMocks.installDynamicImportRecovery,
}))

vi.mock('@/shared/auth/useClaimAnonymousSessionsOnSignIn', () => ({
  useClaimAnonymousSessionsOnSignIn: rootMocks.claimOnSignIn,
}))

vi.mock('sonner', () => ({
  Toaster: () => null,
}))

vi.mock('@tanstack/react-router', () => ({
  HeadContent: () => null,
  Scripts: () => null,
  Outlet: () => <div data-testid="outlet" />,
  Link: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href="/" {...props}>
      {children}
    </a>
  ),
  createRootRoute: (opts: Record<string, unknown>) => ({ options: opts }),
}))

describe('root document hydration hardening', () => {
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
    rootMocks.claimOnSignIn.mockReset()
    rootMocks.useReferralCapture.mockReset()
    rootMocks.installDynamicImportRecovery.mockClear()
    document.documentElement.className = ''
    window.localStorage.clear()
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('exports a notFoundComponent on the root route', async () => {
    const { Route } = await import('@/routes/__root')
    expect(typeof Route.options.notFoundComponent).toBe('function')
  })

  it('publishes the document head metadata every route inherits', async () => {
    const { rootHead } = await import('@/routes/__root')
    const head = rootHead()

    expect(head.meta).toEqual(
      expect.arrayContaining([
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: 'Ship Fast' },
      ]),
    )
    expect(head.links).toEqual(
      expect.arrayContaining([
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '512x512',
          href: '/favicon-512x512.png',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/favicon-180x180.png',
        },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossOrigin: 'anonymous',
        },
      ]),
    )
    const stylesheetHrefs = head.links
      .filter(
        (link: { href?: string; rel?: string }) => link.rel === 'stylesheet',
      )
      .map((link: { href?: string }) => link.href)

    expect(stylesheetHrefs).toHaveLength(2)
    expect(stylesheetHrefs).toEqual(
      expect.arrayContaining([
        expect.stringContaining('fonts.googleapis.com/css2'),
        expect.any(String),
      ]),
    )
    expect(head.scripts).toEqual([
      {
        defer: true,
        'data-domain': 'ship-fast.ai',
        src: 'https://plausible.ship-fast.ai/js/script.js',
      },
    ])
  })

  it('renders the not-found component with 404 content', async () => {
    const { Route } = await import('@/routes/__root')
    const NotFound = Route.options.notFoundComponent as React.ComponentType
    render(<NotFound />)
    expect(screen.getByText('404')).toBeTruthy()
    expect(screen.getByText('Page not found')).toBeTruthy()
    expect(screen.getByText('Go home')).toBeTruthy()
  })

  it('renders a single document shell with Clerk deferred out of the root', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_dummy')
    const { Route } = await import('@/routes/__root')
    const RootComponent = Route.options.component as React.ComponentType
    render(<RootComponent />)
    // The root mounts exactly one <html> document and one <body>.
    expect(document.querySelectorAll('html')).toHaveLength(1)
    expect(document.querySelectorAll('body')).toHaveLength(1)
    // Clerk is lazy-loaded via ClerkConvexProvider on authenticated routes,
    // not mounted in the root shell itself.
    expect(screen.queryByTestId('clerk-provider')).toBeNull()
    // Claim-on-sign-in lives inside ClerkConvexProvider, not the root, so it
    // is not invoked from the root shell.
    expect(rootMocks.claimOnSignIn).not.toHaveBeenCalled()
    // Referral attribution capture is app-wide and must mount before route
    // content so ?ref= links are handled from any entry route.
    expect(rootMocks.useReferralCapture).toHaveBeenCalled()
  })

  it('hydrates the document theme from localStorage and installs dynamic import recovery', async () => {
    window.localStorage.setItem('theme', 'dark')
    const { Route } = await import('@/routes/__root')
    const RootComponent = Route.options.component as React.ComponentType

    render(<RootComponent />)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(rootMocks.installDynamicImportRecovery).toHaveBeenCalledWith(window)
  })

  it('falls back to the system color scheme when no saved theme exists', async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    const { Route } = await import('@/routes/__root')
    const RootComponent = Route.options.component as React.ComponentType

    render(<RootComponent />)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('does not mount anonymous session claiming from the root even when Clerk and VITE_CONVEX_URL are configured', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_dummy')
    vi.stubEnv('VITE_CONVEX_SELF_HOSTED_URL', '')
    vi.stubEnv('VITE_CONVEX_URL', 'https://convex.example.test')
    const { Route } = await import('@/routes/__root')
    const RootComponent = Route.options.component as React.ComponentType

    render(<RootComponent />)

    // Claim-on-sign-in is mounted inside ClerkConvexProvider (lazy, route-gated
    // via AppProviders), not the root shell, so it is not invoked from root.
    expect(rootMocks.claimOnSignIn).not.toHaveBeenCalled()
  })
})
