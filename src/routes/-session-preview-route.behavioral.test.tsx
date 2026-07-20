// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routeParamMocks = vi.hoisted(() => ({
  slug: 'k574ms14ma9f94keq30r7dq24x89n1k2',
  pathname: '/preview/k574ms14ma9f94keq30r7dq24x89n1k2',
}))

type MockRouterState = {
  location: {
    pathname: string
  }
}

type UseRouterStateOptions = {
  select(state: MockRouterState): string
}

type TanStackRouterMock = {
  getRouteApi(path: string): {
    useParams(): {
      slug?: string
    }
  }
  useRouterState(options: UseRouterStateOptions): string
}

vi.mock('@tanstack/react-router', () => {
  const routerMock = {
    getRouteApi(path) {
      return {
        useParams: () =>
          path === '/preview/$slug' ? { slug: routeParamMocks.slug } : {},
      }
    },
    useRouterState({ select }: UseRouterStateOptions) {
      return select({ location: { pathname: routeParamMocks.pathname } })
    },
  } satisfies TanStackRouterMock

  return routerMock
})

vi.mock('@/features/dashboard/components/SessionPreviewPage', async () => {
  const { useContext } = await import('react')
  const { PreviewUrlBridgeContext } = await import('@ship-fast/blocks/runtime')
  type SessionPreviewPageProps = {
    sessionId: string
  }

  function SessionPreviewPage({ sessionId }: SessionPreviewPageProps) {
    const bridge = useContext(PreviewUrlBridgeContext)
    return (
      <main
        data-testid="session-preview-page"
        data-page-from-url={bridge.pageFromUrl ?? ''}
      >
        {sessionId}
      </main>
    )
  }

  return {
    SessionPreviewPage,
  }
})

import {
  PreviewRoute,
  extractPreviewPageSlugFromPath,
} from './-session-preview-route'

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  vi.clearAllMocks()
  routeParamMocks.pathname = '/preview/k574ms14ma9f94keq30r7dq24x89n1k2'
})

describe('extractPreviewPageSlugFromPath', () => {
  it('returns null for the base preview URL', () => {
    expect(
      extractPreviewPageSlugFromPath('/preview/site-123', 'site-123'),
    ).toBeNull()
  })

  it('returns the first nested page segment after the preview slug', () => {
    expect(
      extractPreviewPageSlugFromPath('/preview/site-123/pricing', 'site-123'),
    ).toBe('pricing')
  })
})

describe('PreviewRoute', () => {
  it('passes the preview URL id into the bare session preview page', () => {
    render(<PreviewRoute />)

    expect(screen.getByTestId('session-preview-page').textContent).toBe(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
    )
  })

  it('syncs pageFromUrl from the TanStack location pathname', () => {
    routeParamMocks.pathname =
      '/preview/k574ms14ma9f94keq30r7dq24x89n1k2/pricing'

    render(<PreviewRoute />)

    expect(screen.getByTestId('session-preview-page').dataset.pageFromUrl).toBe(
      'pricing',
    )
  })
})
