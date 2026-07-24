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
  slug: 'noice-momo-center-website-e039',
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
    getRouteApi(path: string) {
      return {
        useParams: () =>
          path === '/deployed/$slug' ? { slug: routeParamMocks.slug } : {},
      }
    },
    useRouterState({ select }: UseRouterStateOptions) {
      // The router's internal pathname is the rewritten /deployed/<slug>/...
      // path; the component reads the browser URL for the page slug instead.
      return select({
        location: { pathname: `/deployed/${routeParamMocks.slug}` },
      })
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
  SubdomainPreviewRoute,
  extractSubdomainPageSlugFromPath,
} from './-subdomain-preview-route'

afterEach(() => {
  cleanup()
})

const setBrowserPath = (pathname: string) => {
  window.history.pushState(null, '', pathname)
}

beforeEach(() => {
  vi.clearAllMocks()
  routeParamMocks.mountCount = 0
  setBrowserPath('/')
})

describe('extractSubdomainPageSlugFromPath', () => {
  it('returns null for the subdomain root', () => {
    expect(extractSubdomainPageSlugFromPath('/')).toBeNull()
    expect(extractSubdomainPageSlugFromPath('')).toBeNull()
  })

  it('returns the first segment for a sub-page', () => {
    expect(extractSubdomainPageSlugFromPath('/pricing')).toBe('pricing')
    expect(extractSubdomainPageSlugFromPath('/blog/post-1')).toBe('blog')
  })
})

describe('SubdomainPreviewRoute', () => {
  it('passes the deployment slug into the session preview page', () => {
    render(<SubdomainPreviewRoute />)

    expect(screen.getByTestId('session-id').textContent).toBe(
      'noice-momo-center-website-e039',
    )
  })

  it('derives pageFromUrl from the browser URL, not the internal router path', () => {
    setBrowserPath('/pricing')

    render(<SubdomainPreviewRoute />)

    expect(screen.getByTestId('session-preview-page').dataset.pageFromUrl).toBe(
      'pricing',
    )
  })

  it('navigates to a clean /<pageSlug> URL without leaking the session id', async () => {
    render(<SubdomainPreviewRoute />)

    fireEvent.click(screen.getByRole('button', { name: 'Go gallery' }))

    await waitFor(() => {
      expect(
        screen.getByTestId('session-preview-page').dataset.pageFromUrl,
      ).toBe('gallery')
    })
    expect(window.location.pathname).toBe('/gallery')
    expect(window.location.pathname).not.toContain('/preview/')
    expect(window.location.pathname).not.toContain('/deployed/')
  })

  it('navigates back to / for the home page', async () => {
    setBrowserPath('/gallery')

    render(<SubdomainPreviewRoute />)

    fireEvent.click(screen.getByRole('button', { name: 'Go home' }))

    await waitFor(() => {
      expect(
        screen.getByTestId('session-preview-page').dataset.pageFromUrl,
      ).toBe('')
    })
    expect(window.location.pathname).toBe('/')
  })

  it('remounts the preview when the page slug changes', async () => {
    setBrowserPath('/gallery')

    render(<SubdomainPreviewRoute />)

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
