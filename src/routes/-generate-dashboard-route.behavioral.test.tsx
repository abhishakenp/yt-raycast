// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentType } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routeParamMocks = vi.hoisted(() => ({
  sessionId: 'test-sess-123',
  pathname: '/generate/test-sess-123',
}))

type MockRouterState = {
  location: {
    pathname: string
  }
}

type UseRouterStateOptions = {
  select(state: MockRouterState): string
}

type MockRoute = {
  options: unknown
  path: string
}

interface CreateFileRouteResult {
  (options: unknown): MockRoute
}

type TanStackRouterMock = {
  createFileRoute(path: string): CreateFileRouteResult
  getRouteApi(path: string): {
    useParams(): {
      sessionId: string
    }
  }
  lazyRouteComponent(importer: unknown, exportName: string): ComponentType
  useRouterState(options: UseRouterStateOptions): string
}

vi.mock('@tanstack/react-router', () => {
  const routerMock = {
    createFileRoute(path) {
      function createRoute(options: unknown) {
        return { options, path }
      }

      return createRoute
    },
    getRouteApi(_path) {
      return {
        useParams: () => ({ sessionId: routeParamMocks.sessionId }),
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

vi.mock('@/features/dashboard/components/Dashboard', async () => {
  const { useContext } = await import('react')
  const { PreviewUrlBridgeContext } = await import('@ship-fast/blocks/runtime')
  type DashboardProps = {
    sessionId: string
  }

  function Dashboard({ sessionId }: DashboardProps) {
    const bridge = useContext(PreviewUrlBridgeContext)
    return (
      <section
        data-testid="dashboard-route"
        data-page-from-url={bridge.pageFromUrl ?? ''}
      >
        {sessionId}
      </section>
    )
  }

  return {
    Dashboard,
  }
})

import { GenerateRoute, extractSlugFromPath } from './-generate-dashboard-route'

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

beforeEach(() => {
  vi.clearAllMocks()
  routeParamMocks.pathname = '/generate/test-sess-123'
})

describe('extractSlugFromPath', () => {
  it('returns null for the base URL (no trailing path)', () => {
    expect(extractSlugFromPath('/generate/sess123', 'sess123')).toBeNull()
  })

  it('returns the first segment after the session base', () => {
    expect(extractSlugFromPath('/generate/sess123/pricing', 'sess123')).toBe(
      'pricing',
    )
  })

  it('returns only the first segment for multi-segment paths', () => {
    expect(
      extractSlugFromPath('/generate/sess123/blog/post-1', 'sess123'),
    ).toBe('blog')
  })

  it('returns null for a different session id', () => {
    expect(
      extractSlugFromPath('/generate/other-sess/pricing', 'sess123'),
    ).toBeNull()
  })

  it('returns null for unrelated paths', () => {
    expect(extractSlugFromPath('/pricing', 'sess123')).toBeNull()
  })
})

describe('GenerateRoute rendering', () => {
  it('renders the dashboard with the session id', () => {
    render(<GenerateRoute />)
    expect(screen.getByTestId('dashboard-route').textContent).toContain(
      'test-sess-123',
    )
  })

  it('syncs pageFromUrl from the TanStack location pathname', () => {
    routeParamMocks.pathname = '/generate/test-sess-123/pricing'

    render(<GenerateRoute />)

    expect(screen.getByTestId('dashboard-route').dataset.pageFromUrl).toBe(
      'pricing',
    )
  })
})
