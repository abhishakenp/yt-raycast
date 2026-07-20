import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
}))

type ClearPromptCacheRoute = {
  path: string
  options: {
    server: {
      handlers: {
        POST: (args: { request: Request }) => Promise<Response>
      }
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isClearPromptCacheRoute(
  route: unknown,
): route is ClearPromptCacheRoute {
  return (
    isRecord(route) &&
    route.path === '/api/clear-prompt-cache' &&
    isRecord(route.options) &&
    isRecord(route.options.server) &&
    isRecord(route.options.server.handlers) &&
    typeof route.options.server.handlers.POST === 'function'
  )
}

function requireClearPromptCacheRoute(route: unknown): ClearPromptCacheRoute {
  if (!isClearPromptCacheRoute(route)) {
    throw new Error('Expected /api/clear-prompt-cache POST route')
  }

  return route
}

describe('/api/clear-prompt-cache route', () => {
  it('asks the browser to clear origin storage without accessing server-side window', async () => {
    const { Route } = await import('./clear-prompt-cache')
    const route = requireClearPromptCacheRoute(Route)

    const response = await route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/clear-prompt-cache', {
        body: JSON.stringify({ prompt: 'Build a cache reset test' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
    })

    expect(route.path).toBe('/api/clear-prompt-cache')
    expect(response.headers.get('Clear-Site-Data')).toBe('"storage"')
    await expect(response.json()).resolves.toEqual({ success: true })
  })

  it('rejects an empty cache-clear request', async () => {
    const { Route } = await import('./clear-prompt-cache')
    const route = requireClearPromptCacheRoute(Route)

    const response = await route.options.server.handlers.POST({
      request: new Request('https://ship-fast.test/api/clear-prompt-cache', {
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Missing prompt' })
  })
})
