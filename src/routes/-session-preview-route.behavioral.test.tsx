// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routeParamMocks = vi.hoisted(() => ({
  mountCount: 0,
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
  const { useContext, useState } = await import('react')
  const { PreviewUrlBridgeContext } = await import('@ship-fast/blocks/runtime')
  type SessionPreviewPageProps = {
    sessionId: string
  }

  function SessionPreviewPage({ sessionId }: SessionPreviewPageProps) {
    const bridge = useContext(PreviewUrlBridgeContext)
    const [mountId] = useState(() => {
      routeParamMocks.mountCount += 1
      return routeParamMocks.mountCount
    })
    return (
      <main
        data-testid="session-preview-page"
        data-mount-id={mountId}
        data-page-from-url={bridge.pageFromUrl ?? ''}
      >
        <span data-testid="session-id">{sessionId}</span>
        <button
          type="button"
          onClick={() => bridge.navigateToPage?.('gallery')}
        >
          Go gallery
        </button>
        <button type="button" onClick={() => bridge.navigateToPage?.(null)}>
          Go home
        </button>
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

const setRoutePath = (pathname: string) => {
  routeParamMocks.pathname = pathname
  window.history.pushState(null, '', pathname)
}

beforeEach(() => {
  vi.clearAllMocks()
  routeParamMocks.mountCount = 0
  setRoutePath('/preview/k574ms14ma9f94keq30r7dq24x89n1k2')
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

    expect(screen.getByTestId('session-id').textContent).toBe(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
    )
  })

  it('syncs pageFromUrl from the TanStack location pathname', () => {
    setRoutePath('/preview/k574ms14ma9f94keq30r7dq24x89n1k2/pricing')

    render(<PreviewRoute />)

    expect(screen.getByTestId('session-preview-page').dataset.pageFromUrl).toBe(
      'pricing',
    )
  })

  it('clears pageFromUrl immediately when generated nav pushes the base preview URL', async () => {
    setRoutePath('/preview/k574ms14ma9f94keq30r7dq24x89n1k2/gallery')

    render(<PreviewRoute />)

    expect(screen.getByTestId('session-preview-page').dataset.pageFromUrl).toBe(
      'gallery',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Go home' }))

    await waitFor(() => {
      expect(
        screen.getByTestId('session-preview-page').dataset.pageFromUrl,
      ).toBe('')
    })
    expect(window.location.pathname).toBe(
      '/preview/k574ms14ma9f94keq30r7dq24x89n1k2',
    )
  })

  it('remounts the rendered preview when generated nav changes the URL page slug', async () => {
    setRoutePath('/preview/k574ms14ma9f94keq30r7dq24x89n1k2/gallery')

    render(<PreviewRoute />)

    const initialMountId = screen.getByTestId('session-preview-page').dataset
      .mountId

    fireEvent.click(screen.getByRole('button', { name: 'Go home' }))

    await waitFor(() => {
      expect(
        screen.getByTestId('session-preview-page').dataset.mountId,
      ).not.toBe(initialMountId)
    })
  })
})
