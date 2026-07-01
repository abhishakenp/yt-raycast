import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const createExportResponseMock = vi.hoisted(() => vi.fn())
const createDeploymentPreviewResponseMock = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
  lazyRouteComponent: (_importer: unknown, exportName: string) => {
    const LazyRouteComponent = () => (
      <div data-testid="lazy-route">{exportName}</div>
    )
    return LazyRouteComponent
  },
}))

vi.mock('@/features/home/components/HomePage', () => ({
  HomePage: () => <main>Home page route</main>,
}))

vi.mock('./pricing/-PricingPage', () => ({
  PricingPage: () => <main>Pricing page route</main>,
}))

vi.mock('./privacy/-PrivacyPage', () => ({
  PrivacyPage: () => <main>Privacy page route</main>,
}))

vi.mock('./terms/-TermsPage', () => ({
  TermsPage: () => <main>Terms page route</main>,
}))

vi.mock('@/features/gallery/components/GalleryPage', () => ({
  GalleryPage: () => <main>Gallery page route</main>,
}))

vi.mock('@/features/gallery/components/MinePage', () => ({
  MinePage: () => <main>Mine page route</main>,
}))

vi.mock('@/features/referrals/components/ReferralDashboard', () => ({
  ReferralDashboard: () => <section>Referral dashboard route</section>,
}))

vi.mock('@/features/exports/server/create-export-response', () => ({
  createExportResponse: createExportResponseMock,
}))

vi.mock('@/features/deployments/server/deployment-preview-response', () => ({
  createDeploymentPreviewResponse: createDeploymentPreviewResponseMock,
}))

type RouteWithHandlers = {
  path: string
  options: {
    component?: React.ComponentType
    server?: {
      handlers: Record<
        string,
        (args: {
          params: Record<string, string>
          request: Request
        }) => Promise<Response>
      >
    }
  }
}

const importRoute = async (path: string): Promise<RouteWithHandlers> => {
  const mod = await import(path)
  return mod.Route as unknown as RouteWithHandlers
}

describe('top-level route behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it.each([
    ['./index', '/', 'HomePage'],
    ['./pricing', '/pricing', 'PricingPage'],
    ['./privacy', '/privacy', 'PrivacyPage'],
    ['./terms', '/terms', 'TermsPage'],
    ['./gallery', '/gallery', 'GalleryPage'],
    ['./mine', '/mine', 'Mine page route'],
  ] as const)(
    'mounts the expected lazy component export for %s',
    async (modulePath, routePath, exportName) => {
      const Route = await importRoute(modulePath)
      const Component = Route.options.component

      expect(Route.path).toBe(routePath)
      render(React.createElement(Component as React.ComponentType))
      expect(
        screen.queryByTestId('lazy-route')?.textContent ??
          screen.getByText(exportName).textContent,
      ).toBe(exportName)
    },
  )

  it('wraps the referral dashboard in the referrals page shell', async () => {
    const Route = await importRoute('./referrals')
    const Component = Route.options.component

    expect(Route.path).toBe('/referrals')
    render(React.createElement(Component as React.ComponentType))
    expect(screen.getByText('Referral dashboard route')).toBeTruthy()
    expect(
      screen.getByText('Referral dashboard route').closest('main')?.className,
    ).toContain('min-h-screen')
  })

  it.each([
    ['./generate.$sessionId', '/generate/$sessionId', 'GenerateRoute'],
    [
      './generate.$sessionId.admin',
      '/generate/$sessionId/admin',
      'GenerateAdminRoute',
    ],
  ] as const)(
    'mounts the correct lazy dashboard export for %s',
    async (modulePath, routePath, exportName) => {
      const Route = await importRoute(modulePath)
      const Component = Route.options.component

      expect(Route.path).toBe(routePath)
      render(React.createElement(Component as React.ComponentType))
      expect(screen.getByTestId('lazy-route').textContent).toBe(exportName)
    },
  )

  it('delegates the export route with real session and target params from Convex', async () => {
    createExportResponseMock.mockResolvedValue(new Response('export body'))
    const Route = await importRoute('./export.$sessionId.$target')
    const request = new Request(
      'https://ship-fast.io/export/k574ms14ma9f94keq30r7dq24x89n1k2/html',
    )

    const response = await Route.options.server?.handlers.GET({
      params: {
        sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
        target: 'html',
      },
      request,
    })

    expect(Route.path).toBe('/export/$sessionId/$target')
    expect(response?.status).toBe(200)
    expect(await response?.text()).toBe('export body')
    expect(createExportResponseMock).toHaveBeenCalledWith(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
      'html',
      request,
    )
  })

  it('delegates the public preview route with a real deployment slug from Convex', async () => {
    createDeploymentPreviewResponseMock.mockResolvedValue(
      new Response('preview body'),
    )
    const Route = await importRoute('./preview.$slug')
    const request = new Request(
      'https://ship-fast.io/preview/a-craft-beer-brewery',
    )

    const response = await Route.options.server?.handlers.GET({
      params: { slug: 'a-craft-beer-brewery' },
      request,
    })

    expect(Route.path).toBe('/preview/$slug')
    expect(response?.status).toBe(200)
    expect(await response?.text()).toBe('preview body')
    expect(createDeploymentPreviewResponseMock).toHaveBeenCalledWith(
      'a-craft-beer-brewery',
      request,
    )
  })
})
