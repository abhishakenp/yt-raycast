import { beforeEach, describe, expect, it, vi } from 'vitest'

const routeMocks = vi.hoisted(() => ({
  createHealthApiResponse: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
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

describe('/api/health route', () => {
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
    const healthRoute = Route as unknown as HealthRoute
    const response = await healthRoute.options.server.handlers.GET()

    expect(healthRoute.path).toBe('/api/health')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      convex: 'reachable',
      latencyMs: 12,
    })
    expect(routeMocks.createHealthApiResponse).toHaveBeenCalledOnce()
  })
})
