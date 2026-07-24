import { describe, expect, it, vi } from 'vitest'

const routerMocks = vi.hoisted(() => ({
  createRouter: vi.fn((options: unknown) => ({ kind: 'router', options })),
  routeTree: { id: 'root-route-tree' },
}))

vi.mock('@tanstack/react-router', () => ({
  createRouter: routerMocks.createRouter,
}))

vi.mock('./routeTree.gen', () => ({
  routeTree: routerMocks.routeTree,
}))

describe('getRouter', () => {
  it('creates the TanStack router with app-wide navigation defaults', async () => {
    const { getRouter } = await import('./router')

    const router = getRouter()

    expect(router).toEqual(
      expect.objectContaining({
        kind: 'router',
        options: expect.objectContaining({
          routeTree: routerMocks.routeTree,
          scrollRestoration: true,
          defaultPreload: 'intent',
          defaultPreloadStaleTime: 0,
          rewrite: expect.objectContaining({
            input: expect.any(Function),
            output: expect.any(Function),
          }),
        }),
      }),
    )
    expect(routerMocks.createRouter).toHaveBeenCalledTimes(1)
  })
})
