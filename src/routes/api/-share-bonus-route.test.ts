import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: Record<string, unknown>) => ({
    options,
    path,
  }),
}))

type RouteWithHandlers = {
  path: string
  options: {
    server: {
      handlers: Record<
        string,
        (args: { request: Request }) => Promise<Response>
      >
    }
  }
}

function requestWithIp(ip: string, method: 'GET' | 'POST' = 'GET') {
  return new Request('https://ship-fast.test/api/share-bonus', {
    method,
    headers: { 'x-forwarded-for': ip },
  })
}

describe('/api/share-bonus route', () => {
  it('registers GET and POST handlers at /api/share-bonus', async () => {
    const { Route } = await import('./share-bonus')
    const route = Route as unknown as RouteWithHandlers

    expect(route.path).toBe('/api/share-bonus')
    expect(typeof route.options.server.handlers.GET).toBe('function')
    expect(typeof route.options.server.handlers.POST).toBe('function')
  })

  it('GET reports claimed=false for a fresh IP', async () => {
    const { Route } = await import('./share-bonus')
    const route = Route as unknown as RouteWithHandlers

    const res = await route.options.server.handlers.GET({
      request: requestWithIp('203.0.113.1'),
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ claimed: false })
  })

  it('POST claims the bonus for a fresh IP and then GET reports claimed', async () => {
    const { Route } = await import('./share-bonus')
    const route = Route as unknown as RouteWithHandlers

    const claim = await route.options.server.handlers.POST({
      request: requestWithIp('203.0.113.2', 'POST'),
    })
    expect(claim.status).toBe(200)
    expect(await claim.json()).toEqual({ claimed: true, success: true })

    const status = await route.options.server.handlers.GET({
      request: requestWithIp('203.0.113.2'),
    })
    expect(await status.json()).toEqual({ claimed: true })
  })

  it('POST refuses to re-claim on the same day', async () => {
    const { Route } = await import('./share-bonus')
    const route = Route as unknown as RouteWithHandlers

    await route.options.server.handlers.POST({
      request: requestWithIp('203.0.113.3', 'POST'),
    })
    const second = await route.options.server.handlers.POST({
      request: requestWithIp('203.0.113.3', 'POST'),
    })
    expect(await second.json()).toEqual({ claimed: true, success: false })
  })

  it('uses the first forwarded IP so proxy chains do not share one bonus bucket', async () => {
    const { Route } = await import('./share-bonus')
    const route = Route as unknown as RouteWithHandlers

    const first = await route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/share-bonus', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '203.0.113.10, 198.51.100.1',
        },
      }),
    })
    const secondSameClient = await route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/share-bonus', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '203.0.113.10, 198.51.100.77',
        },
      }),
    })
    const differentClientSameProxy = await route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/share-bonus', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '203.0.113.11, 198.51.100.1',
        },
      }),
    })

    expect(await first.json()).toEqual({ claimed: true, success: true })
    expect(await secondSameClient.json()).toEqual({
      claimed: true,
      success: false,
    })
    expect(await differentClientSameProxy.json()).toEqual({
      claimed: true,
      success: true,
    })
  })

  it('falls back to Cloudflare connecting IP when forwarded-for is absent', async () => {
    const { Route } = await import('./share-bonus')
    const route = Route as unknown as RouteWithHandlers

    const claim = await route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/share-bonus', {
        method: 'POST',
        headers: { 'cf-connecting-ip': '203.0.113.20' },
      }),
    })
    const status = await route.options.server.handlers.GET({
      request: new Request('https://ship-fast.test/api/share-bonus', {
        headers: { 'cf-connecting-ip': '203.0.113.20' },
      }),
    })

    expect(await claim.json()).toEqual({ claimed: true, success: true })
    expect(await status.json()).toEqual({ claimed: true })
  })

  it('does not grant a share bonus to requests without an attributable client IP', async () => {
    const { Route } = await import('./share-bonus')
    const route = Route as unknown as RouteWithHandlers

    const response = await route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/share-bonus', {
        method: 'POST',
      }),
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      claimed: false,
      error: 'Unable to identify client IP.',
      success: false,
    })
  })

  it('does not report share bonus status for requests without an attributable client IP', async () => {
    const { Route } = await import('./share-bonus')
    const route = Route as unknown as RouteWithHandlers

    const response = await route.options.server.handlers.GET({
      request: new Request('https://ship-fast.test/api/share-bonus'),
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      claimed: false,
      error: 'Unable to identify client IP.',
      success: false,
    })
  })
})
