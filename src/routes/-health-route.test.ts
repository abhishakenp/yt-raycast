import { beforeEach, describe, expect, it, vi } from 'vitest'

const routeMocks = vi.hoisted(function createRouteMocks() {
  function createFileRoute(path: string) {
    function buildRoute(options: unknown) {
      return { options, path }
    }

    return buildRoute
  }

  return {
    createFileRoute,
    createHealthApiResponse: vi.fn(),
  }
})

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: routeMocks.createFileRoute,
}))

vi.mock('@/features/health/server/health-api-response', () => ({
  createHealthApiResponse: routeMocks.createHealthApiResponse,
}))

type HealthRoute = {
  path: string
  options: {
    server: {
      handlers: {
        GET: () => Promise<Response>
      }
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isHealthRoute(route: unknown): route is HealthRoute {
  if (!isRecord(route) || route.path !== '/health') return false
  if (!isRecord(route.options)) return false
  if (!isRecord(route.options.server)) return false
  if (!isRecord(route.options.server.handlers)) return false
  return typeof route.options.server.handlers.GET === 'function'
}

function requireHealthRoute(route: unknown) {
  if (!isHealthRoute(route)) throw new Error('Expected /health route')
  return route
}

describe('/health route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers GET and returns the health response unchanged', async () => {
    routeMocks.createHealthApiResponse.mockResolvedValue(
      new Response(
        JSON.stringify({ ok: true, convex: 'reachable', latencyMs: 12 }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      ),
    )

    const { Route } = await import('./health')
    const healthRoute = requireHealthRoute(Route)
    const response = await healthRoute.options.server.handlers.GET()

    expect(healthRoute.path).toBe('/health')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      convex: 'reachable',
      latencyMs: 12,
    })
    expect(routeMocks.createHealthApiResponse).toHaveBeenCalledOnce()
  })
})
