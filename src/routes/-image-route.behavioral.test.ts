import { describe, expect, it, vi } from 'vitest'

const routeMocks = vi.hoisted(() => ({
  image: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: Record<string, unknown>) => ({
    options,
    path,
  }),
}))

vi.mock('@/features/gallery/server/gallery-preview-image-response', () => ({
  createGalleryPreviewImageResponse: routeMocks.image,
}))

type RouteWithHandlers = {
  path: string
  options: {
    server: {
      handlers: {
        GET: (args: {
          params: { sessionId: string }
          request: Request
        }) => Promise<Response>
      }
    }
  }
}

describe('image route', () => {
  it('delegates one session id to the gallery preview image response', async () => {
    routeMocks.image.mockResolvedValue(new Response('png bytes'))

    const mod = await import('./api/images.$sessionId')
    const Route = mod.Route as unknown as RouteWithHandlers
    const request = new Request('https://ship-fast.io/api/images/session-1')
    const response = await Route.options.server.handlers.GET({
      params: { sessionId: 'session-1' },
      request,
    })

    expect(Route.path).toBe('/api/images/$sessionId')
    expect(await response.text()).toBe('png bytes')
    expect(routeMocks.image).toHaveBeenCalledWith('session-1')
  })
})
