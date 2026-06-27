// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

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
  useReferralCapture: () => {},
}))

vi.mock('@/lib/chunk-load-recovery', () => ({
  installDynamicImportRecovery: () => () => {},
}))

vi.mock('sonner', () => ({
  Toaster: () => null,
}))

vi.mock('@tanstack/react-router', () => ({
  HeadContent: () => null,
  Scripts: () => null,
  Outlet: () => <div data-testid="outlet" />,
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
    vi.unstubAllEnvs()
  })

  it('exports a notFoundComponent on the root route', async () => {
    const { Route } = await import('@/routes/__root')
    expect(typeof Route.options.notFoundComponent).toBe('function')
  })

  it('renders the not-found component with 404 content', async () => {
    const { Route } = await import('@/routes/__root')
    const NotFound = Route.options.notFoundComponent as React.ComponentType
    render(<NotFound />)
    expect(screen.getByText('404')).toBeTruthy()
    expect(screen.getByText('Page not found')).toBeTruthy()
    expect(screen.getByText('Go home')).toBeTruthy()
  })

  it('renders a single document shell with one ClerkProvider', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_dummy')
    const { Route } = await import('@/routes/__root')
    const RootComponent = Route.options.component as React.ComponentType
    render(<RootComponent />)
    // The root mounts exactly one <html> document and one ClerkProvider shell.
    expect(document.querySelectorAll('html')).toHaveLength(1)
    expect(document.querySelectorAll('body')).toHaveLength(1)
    expect(screen.getAllByTestId('clerk-provider')).toHaveLength(1)
  })
})
