import { describe, expect, it, vi } from 'vitest'

const routeMocks = vi.hoisted(() => ({
  generate: vi.fn(),
  get: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
}))

vi.mock('@/features/gallery/server/gallery-preview-image-generation', () => ({
  generateGalleryPreviewImage: routeMocks.generate,
}))

vi.mock('@/features/gallery/server/gallery-preview-image-response', () => ({
  createGalleryPreviewImageResponse: routeMocks.get,
}))

type RouteWithHandlers = {
  options: {
    server: {
      handlers: Record<
        string,
        (args: {
          params: { sessionId: string }
          request: Request
        }) => Promise<Response>
      >
    }
  }
}

const sessionId = 'a'.repeat(32)

describe('/api/images/$sessionId', () => {
  it('keeps GET storage-only and delegates POST to the save-time worker', async () => {
    routeMocks.get.mockResolvedValue(new Response('png'))
    routeMocks.generate.mockResolvedValue({ status: 'stored' })
    const { Route } = await import('./images.$sessionId')
    const route = Route as unknown as RouteWithHandlers

    await route.options.server.handlers.GET({
      params: { sessionId },
      request: new Request(
        `https://ship-fast.test/api/images/${sessionId}?v=revision-1`,
      ),
    })
    const post = await route.options.server.handlers.POST({
      params: { sessionId },
      request: new Request(
        `https://ship-fast.test/api/images/${sessionId}?v=revision-1`,
        {
          body: JSON.stringify({ anonymousOwnerSecret: 'owner-secret' }),
          method: 'POST',
        },
      ),
    })

    expect(routeMocks.get).toHaveBeenCalledWith(sessionId, {
      cacheVersion: 'revision-1',
    })
    expect(routeMocks.generate).toHaveBeenCalledWith({
      anonymousOwnerSecret: 'owner-secret',
      bearerToken: undefined,
      cacheVersion: 'revision-1',
      sessionId,
    })
    expect(post.status).toBe(200)
    expect(await post.json()).toEqual({ status: 'stored' })
  })

  it('rejects unauthenticated, invalid, and stale POST jobs before visitors can trigger rendering', async () => {
    const { Route } = await import('./images.$sessionId')
    const route = Route as unknown as RouteWithHandlers
    const noOwner = await route.options.server.handlers.POST({
      params: { sessionId },
      request: new Request(
        `https://ship-fast.test/api/images/${sessionId}?v=revision-1`,
        { method: 'POST' },
      ),
    })
    const badVersion = await route.options.server.handlers.POST({
      params: { sessionId },
      request: new Request(
        `https://ship-fast.test/api/images/${sessionId}?v=../../bad`,
        {
          headers: { Authorization: 'Bearer token' },
          method: 'POST',
        },
      ),
    })
    routeMocks.generate.mockResolvedValueOnce({ status: 'stale' })
    const stale = await route.options.server.handlers.POST({
      params: { sessionId },
      request: new Request(
        `https://ship-fast.test/api/images/${sessionId}?v=revision-2`,
        {
          headers: { Authorization: 'Bearer token' },
          method: 'POST',
        },
      ),
    })

    expect(noOwner.status).toBe(401)
    expect(badVersion.status).toBe(400)
    expect(stale.status).toBe(409)
    expect(await stale.json()).toEqual({ status: 'stale' })
  })
})
