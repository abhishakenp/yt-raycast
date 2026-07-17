// @vitest-environment jsdom
import React from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routerMocks = vi.hoisted(() => ({
  createRootRoute: vi.fn((options: unknown) => ({
    options,
    path: '__root',
  })),
}))

const acquisitionCaptureMock = vi.hoisted(() => vi.fn())
const installDynamicImportRecoveryMock = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-router', () => ({
  createRootRoute: routerMocks.createRootRoute,
  HeadContent: () => <meta data-testid="head-content" />,
  Link: ({
    children,
    className,
    to,
  }: {
    children: React.ReactNode
    className?: string
    to: string
  }) => (
    <a className={className} href={to}>
      {children}
    </a>
  ),
  Outlet: () => <main data-testid="route-outlet">Route content</main>,
  Scripts: () => <script data-testid="route-scripts" />,
}))

vi.mock('sonner', () => ({
  Toaster: ({ richColors }: { richColors?: boolean }) => (
    <div data-rich-colors={richColors === true ? 'true' : 'false'}>Toasts</div>
  ),
}))

vi.mock('@/app/providers/AppProviders', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-providers">{children}</div>
  ),
}))

vi.mock('@/features/partners/hooks/useAcquisitionCapture', () => ({
  useAcquisitionCapture: acquisitionCaptureMock,
}))

vi.mock('@/features/partners/components/MarketingConsentController', () => ({
  MarketingConsentController: () => (
    <div data-testid="marketing-consent-controller" />
  ),
}))

vi.mock('@/features/referrals/hooks/useReferralCapture', () => ({
  useReferralCapture: vi.fn(),
}))

vi.mock('@/lib/chunk-load-recovery', () => ({
  installDynamicImportRecovery: installDynamicImportRecoveryMock,
}))

const { Route, rootHead } = await import('./__root')

type RootRouteOptions = {
  component: React.ComponentType
  notFoundComponent: React.ComponentType
}

const rootRouteOptions = Route.options as unknown as RootRouteOptions

describe('__root route behavior', () => {
  beforeEach(() => {
    cleanup()
    localStorage.clear()
    document.documentElement.className = ''
    acquisitionCaptureMock.mockClear()
    installDynamicImportRecoveryMock.mockClear()
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: false })),
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('publishes app metadata, favicons, stylesheet, and Plausible script through the route head contract', () => {
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
        expect.objectContaining({ rel: 'icon', href: '/favicon.ico' }),
        expect.objectContaining({
          rel: 'apple-touch-icon',
          href: '/favicon-180x180.png',
        }),
        expect.objectContaining({
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        }),
      ]),
    )
    expect(head.links.some((link) => link.rel === 'stylesheet')).toBe(true)
    expect(head.scripts).toEqual([
      {
        defer: true,
        'data-domain': 'ship-fast.ai',
        src: 'https://plausible.ship-fast.ai/js/script.js',
      },
    ])
  })

  it('mounts providers, acquisition capture, consent, and recovery from the root component', async () => {
    localStorage.setItem('theme', 'dark')

    render(React.createElement(rootRouteOptions.component))

    expect(acquisitionCaptureMock).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('marketing-consent-controller')).toBeTruthy()
    expect(screen.getByTestId('app-providers')).toBeTruthy()
    expect(screen.getByTestId('route-outlet')).toBeTruthy()
    expect(screen.getByText('Toasts').getAttribute('data-rich-colors')).toBe(
      'true',
    )
    expect(screen.getByTestId('route-scripts')).toBeTruthy()
    await waitFor(() =>
      expect(document.documentElement.classList.contains('dark')).toBe(true),
    )
    expect(installDynamicImportRecoveryMock).toHaveBeenCalledWith(window)
  })

  it('keeps the root app shell mounted when matchMedia is unavailable', async () => {
    localStorage.removeItem('theme')
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: undefined,
    })

    expect(() =>
      render(React.createElement(rootRouteOptions.component)),
    ).not.toThrow()

    expect(screen.getByTestId('app-providers')).toBeTruthy()
    expect(screen.getByTestId('route-outlet')).toBeTruthy()
    await waitFor(() =>
      expect(installDynamicImportRecoveryMock).toHaveBeenCalledWith(window),
    )
  })

  it('keeps the root app shell mounted when localStorage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage unavailable')
    })

    expect(() =>
      render(React.createElement(rootRouteOptions.component)),
    ).not.toThrow()

    expect(screen.getByTestId('app-providers')).toBeTruthy()
    expect(screen.getByTestId('route-outlet')).toBeTruthy()
    await waitFor(() =>
      expect(installDynamicImportRecoveryMock).toHaveBeenCalledWith(window),
    )
  })

  it('renders the 404 page inside the existing document shell instead of nesting another html document', () => {
    const view = render(React.createElement(rootRouteOptions.notFoundComponent))

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Go home' }).getAttribute('href'),
    ).toBe('/')
    expect(view.container.querySelector('html')).toBeNull()
    expect(view.container.querySelector('main')).toBeTruthy()
  })
})
