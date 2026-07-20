import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const createExportResponseMock = vi.hoisted(() => vi.fn())
const createDeploymentPreviewResponseMock = vi.hoisted(() => vi.fn())
const routeParamMocks = vi.hoisted(() => {
  const paramsByPath: Record<string, Record<string, string>> = {
    '/generate/$sessionId/$': {
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
    },
    '/generate/$sessionId/admin': {
      sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
    },
  }

  return {
    paramsByPath,
    pathname: '/generate/k574ms14ma9f94keq30r7dq24x89n1k2',
  }
})

type MockRouterState = {
  location: {
    pathname: string
  }
}

type UseRouterStateOptions = {
  select(state: MockRouterState): string
}

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

type RouteModule = {
  Route: RouteWithHandlers
}

type MockRoute = {
  options: Record<string, unknown>
  path: string
}

interface CreateFileRouteResult {
  (options: Record<string, unknown>): MockRoute
}

type TanStackRouterMock = {
  createFileRoute(path: string): CreateFileRouteResult
  getRouteApi(path: string): {
    useParams(): Record<string, string>
  }
  lazyRouteComponent(importer: unknown, exportName: string): React.ComponentType
  useRouterState(options: UseRouterStateOptions): string
}

const topLevelRouteCases = [
  ['./index', '/', 'HomePage'],
  ['./pricing', '/pricing', 'PricingPage'],
  ['./partners', '/partners', 'PartnersPage'],
  ['./privacy', '/privacy', 'PrivacyPage'],
  ['./terms', '/terms', 'TermsPage'],
  ['./gallery', '/gallery', 'GalleryPage'],
  ['./mine', '/mine', 'Mine page route'],
] satisfies ReadonlyArray<readonly [string, string, string]>

const generateRouteCases = [
  ['./generate.$sessionId.$', '/generate/$sessionId/$', 'GenerateRoute'],
  [
    './generate.$sessionId.admin',
    '/generate/$sessionId/admin',
    'GenerateAdminRoute',
  ],
] satisfies ReadonlyArray<readonly [string, string, string]>

vi.mock('@tanstack/react-router', () => {
  const routerMock = {
    createFileRoute(path) {
      function createRoute(options: Record<string, unknown>) {
        return {
          options,
          path,
        }
      }

      return createRoute
    },
    getRouteApi(path) {
      return {
        useParams: () => routeParamMocks.paramsByPath[path] ?? {},
      }
    },
    lazyRouteComponent(_importer, exportName) {
      const LazyRouteComponent = () => (
        <div data-testid="lazy-route">{exportName}</div>
      )
      return LazyRouteComponent
    },
    useRouterState({ select }: UseRouterStateOptions) {
      return select({ location: { pathname: routeParamMocks.pathname } })
    },
  } satisfies TanStackRouterMock

  return routerMock
})

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

type DashboardMockProps = {
  initialAdminView?: boolean
  sessionId?: string
}

vi.mock('@/features/dashboard/components/Dashboard', () => {
  function Dashboard({ initialAdminView, sessionId }: DashboardMockProps) {
    return (
      <section
        data-admin={initialAdminView === true ? 'true' : 'false'}
        data-testid="dashboard-route"
      >
        {sessionId}
      </section>
    )
  }

  return { Dashboard }
})

vi.mock('@/features/exports/server/create-export-response', () => ({
  createExportResponse: createExportResponseMock,
}))

vi.mock('@/features/deployments/server/deployment-preview-response', () => ({
  createDeploymentPreviewResponse: createDeploymentPreviewResponseMock,
}))

async function importRoute(path: string): Promise<RouteWithHandlers> {
  const mod: RouteModule = await import(path)
  return mod.Route
}

function requireComponent(
  component?: React.ComponentType,
): React.ComponentType {
  if (!component) {
    throw new Error('Expected route component')
  }

  return component
}

describe('top-level route behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it.each(topLevelRouteCases)(
    'mounts the expected lazy component export for %s',
    async (modulePath, routePath, exportName) => {
      const Route = await importRoute(modulePath)
      const Component = requireComponent(Route.options.component)

      expect(Route.path).toBe(routePath)
      render(<Component />)
      expect(
        screen.queryByTestId('lazy-route')?.textContent ??
          screen.getByText(exportName).textContent,
      ).toBe(exportName)
    },
  )

  it('wraps the referral dashboard in the referrals page shell', async () => {
    const Route = await importRoute('./referrals')
    const Component = requireComponent(Route.options.component)

    expect(Route.path).toBe('/referrals')
    render(<Component />)
    expect(screen.getByText('Referral dashboard route')).toBeTruthy()
    expect(
      screen.getByText('Referral dashboard route').closest('main')?.className,
    ).toContain('min-h-screen')
  })

  it.each(generateRouteCases)(
    'mounts the correct lazy dashboard export for %s',
    async (modulePath, routePath, exportName) => {
      const Route = await importRoute(modulePath)
      const Component = requireComponent(Route.options.component)

      expect(Route.path).toBe(routePath)
      render(<Component />)
      expect(screen.getByTestId('lazy-route').textContent).toBe(exportName)
    },
  )

  it('passes generate route params into the dashboard workspace', async () => {
    const { GenerateRoute } = await import('./-generate-dashboard-route')

    render(<GenerateRoute />)

    const dashboard = screen.getByTestId('dashboard-route')
    expect(dashboard.textContent).toBe('k574ms14ma9f94keq30r7dq24x89n1k2')
    expect(dashboard.getAttribute('data-admin')).toBe('false')
  })

  it('passes generate admin route params and initial admin mode into the dashboard workspace', async () => {
    const { GenerateAdminRoute } = await import('./-generate-dashboard-route')

    render(<GenerateAdminRoute />)

    const dashboard = screen.getByTestId('dashboard-route')
    expect(dashboard.textContent).toBe('k574ms14ma9f94keq30r7dq24x89n1k2')
    expect(dashboard.getAttribute('data-admin')).toBe('true')
  })

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

  it('renders the bare session preview route lazily', async () => {
    const Route = await importRoute('./preview.$slug')
    const PreviewComponent = Route.options.component

    expect(Route.path).toBe('/preview/$slug')
    expect(Route.options.server).toBeUndefined()
    expect(PreviewComponent).toBeTypeOf('function')

    render(PreviewComponent ? <PreviewComponent /> : null)

    expect(screen.getByTestId('lazy-route').textContent).toBe('PreviewRoute')
  })

  it('renders the bare session preview route for nested page slugs', async () => {
    const Route = await importRoute('./preview.$slug.$')
    const PreviewComponent = Route.options.component

    expect(Route.path).toBe('/preview/$slug/$')
    expect(Route.options.server).toBeUndefined()
    expect(PreviewComponent).toBeTypeOf('function')

    render(PreviewComponent ? <PreviewComponent /> : null)

    expect(screen.getByTestId('lazy-route').textContent).toBe('PreviewRoute')
  })

  it('serves a deployment preview from its Ship Fast subdomain root', async () => {
    createDeploymentPreviewResponseMock.mockResolvedValue(
      new Response('<h1>Craft Beer Brewery</h1>'),
    )
    const Route = await importRoute('./index')
    const request = new Request('https://a-craft-beer-brewery.ship-fast.io/')
    const handler = Route.options.server?.handlers.GET

    expect(handler).toBeTypeOf('function')

    const response = await handler?.({ params: {}, request })

    expect(response?.status).toBe(200)
    expect(await response?.text()).toContain('Craft Beer Brewery')
    expect(createDeploymentPreviewResponseMock).toHaveBeenCalledWith(
      'a-craft-beer-brewery',
      request,
    )
  })
})
