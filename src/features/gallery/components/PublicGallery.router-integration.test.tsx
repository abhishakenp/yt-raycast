// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn().mockResolvedValue({ deleted: 0 }),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isPending: true }),
}))

import { GalleryGrid, type GalleryPayload } from './PublicGallery'

const gallery: GalleryPayload = {
  availableCategories: [],
  hasNext: false,
  hasPrev: false,
  items: [
    {
      prompt: 'Router release preview',
      sessionId: 'router-release-session',
    },
  ],
  limit: 12,
  page: 1,
  total: 1,
  totalPages: 1,
}

const GalleryRouteComponent = () => <GalleryGrid gallery={gallery} />

const createGalleryRouter = () => {
  const rootRoute = createRootRoute({ component: () => <Outlet /> })
  const galleryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/gallery',
    component: GalleryRouteComponent,
  })
  const generateSplatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/generate/$sessionId/$',
    component: () => <main>Generate page</main>,
  })

  return createRouter({
    history: createMemoryHistory({ initialEntries: ['/gallery'] }),
    routeTree: rootRoute.addChildren([galleryRoute, generateSplatRoute]),
  })
}

describe('public gallery router integration', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('builds dashboard links through the page-splat route without warnings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const router = createGalleryRouter()

    await router.load()
    render(<RouterProvider router={router} />)

    const card = await screen.findByRole('link', {
      name: 'Open Router release preview',
    })
    expect(card.getAttribute('href')).toBe('/generate/router-release-session')

    const routeWarnings = warn.mock.calls
      .map((args) => args.map(String).join(' '))
      .filter(
        (message) =>
          message.includes('/generate/$sessionId') &&
          message.includes('/generate/$sessionId/$'),
      )
    expect(routeWarnings).toEqual([])
  })
})
