import { beforeEach, describe, expect, it, vi } from 'vitest'

const githubOAuthMocks = vi.hoisted(() => ({
  callback: vi.fn(),
  start: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
}))

vi.mock('@/features/github/server/github-oauth-response', () => ({
  createGitHubConnectCallbackResponse: githubOAuthMocks.callback,
  createGitHubConnectStartResponse: githubOAuthMocks.start,
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

const importRoute = async (path: string): Promise<RouteWithHandlers> => {
  const mod = await import(path)
  return mod.Route as unknown as RouteWithHandlers
}

describe('GitHub connect API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delegates GitHub OAuth start POST requests', async () => {
    githubOAuthMocks.start.mockResolvedValue(new Response('start'))
    const Route = await importRoute('./github.connect.start')
    const request = new Request(
      'https://ship-fast.io/api/github/connect/start',
      {
        method: 'POST',
      },
    )

    const response = await Route.options.server.handlers.POST({ request })

    expect(Route.path).toBe('/api/github/connect/start')
    expect(await response.text()).toBe('start')
    expect(githubOAuthMocks.start).toHaveBeenCalledWith(request)
  })

  it('delegates GitHub OAuth callback GET requests with query params intact', async () => {
    githubOAuthMocks.callback.mockResolvedValue(new Response('callback'))
    const Route = await importRoute('./github.connect.callback')
    const request = new Request(
      'https://ship-fast.io/api/github/connect/callback?code=callback-code&state=state_123',
    )

    const response = await Route.options.server.handlers.GET({ request })

    expect(Route.path).toBe('/api/github/connect/callback')
    expect(await response.text()).toBe('callback')
    expect(githubOAuthMocks.callback).toHaveBeenCalledWith(request)
  })
})
