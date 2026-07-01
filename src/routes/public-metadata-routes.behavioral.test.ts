import { describe, expect, it, vi } from 'vitest'

const createPublicMetadataResponseMock = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
}))

vi.mock('@/features/deployments/server/public-metadata-response', () => ({
  createPublicMetadataResponse: createPublicMetadataResponseMock,
}))

type RouteWithHandlers = {
  path: string
  options: {
    server: {
      handlers: Record<
        string,
        (args: {
          params?: Record<string, string>
          request: Request
        }) => Response
      >
    }
  }
}

const importRoute = async (path: string): Promise<RouteWithHandlers> => {
  const mod = await import(path)
  return mod.Route as unknown as RouteWithHandlers
}

describe('public metadata route handlers', () => {
  it.each([
    ['./robots[.]txt', '/robots.txt', 'robots'],
    ['./sitemap[.]xml', '/sitemap.xml', 'sitemap'],
    ['./llms[.]txt', '/llms.txt', 'llms'],
  ] as const)(
    'delegates %s to app-level %s metadata',
    async (modulePath, routePath, kind) => {
      createPublicMetadataResponseMock.mockResolvedValue(
        new Response(`${kind} metadata`),
      )
      const Route = await importRoute(modulePath)
      const request = new Request(`https://ship-fast.io${routePath}`)

      const response = await Route.options.server.handlers.GET({ request })

      expect(Route.path).toBe(routePath)
      expect(response.status).toBe(200)
      expect(await response.text()).toBe(`${kind} metadata`)
      expect(createPublicMetadataResponseMock).toHaveBeenCalledWith(
        kind,
        request,
      )
    },
  )

  it.each([
    [
      './preview.$slug.robots[.]txt',
      '/preview/$slug/robots.txt',
      'robots',
      '/preview/a-craft-beer-brewery/robots.txt',
    ],
    [
      './preview.$slug.sitemap[.]xml',
      '/preview/$slug/sitemap.xml',
      'sitemap',
      '/preview/a-craft-beer-brewery/sitemap.xml',
    ],
    [
      './preview.$slug.llms[.]txt',
      '/preview/$slug/llms.txt',
      'llms',
      '/preview/a-craft-beer-brewery/llms.txt',
    ],
  ] as const)(
    'delegates %s to deployment metadata with the route slug',
    async (modulePath, routePath, kind, requestPath) => {
      createPublicMetadataResponseMock.mockResolvedValue(
        new Response(`${kind} deployment metadata`),
      )
      const Route = await importRoute(modulePath)
      const request = new Request(`https://ship-fast.io${requestPath}`)

      const response = await Route.options.server.handlers.GET({
        params: { slug: 'a-craft-beer-brewery' },
        request,
      })

      expect(Route.path).toBe(routePath)
      expect(response.status).toBe(200)
      expect(await response.text()).toBe(`${kind} deployment metadata`)
      expect(createPublicMetadataResponseMock).toHaveBeenCalledWith(
        kind,
        request,
        { slug: 'a-craft-beer-brewery' },
      )
    },
  )
})
