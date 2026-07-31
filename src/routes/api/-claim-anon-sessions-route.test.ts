import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: Record<string, unknown>) => ({
    options,
    path,
  }),
}))

vi.mock('../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      claimAnonymousSessionsByIpMutation:
        'sessions.claimAnonymousSessionsByIpMutation',
    },
  },
}))

const convexMutation = vi.fn()

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => ({
    setAuth: vi.fn(),
    mutation: convexMutation,
  }),
}))

vi.mock('@/features/notifications/slack-business', () => ({
  sendBusinessNotification: vi.fn().mockResolvedValue(undefined),
  userRegisteredEvent: vi.fn().mockReturnValue({}),
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

function requestWithBearer(token: string | null) {
  const headers: Record<string, string> = {}
  if (token) headers.authorization = `Bearer ${token}`
  return new Request('https://ship-fast.test/api/claim-anon-sessions', {
    method: 'POST',
    headers,
  })
}

// A realistic-looking Clerk JWT payload (header.payload.sig) — only the
// payload is decoded by the route, so the header/signature can be junk.
const VALID_JWT = `header.${Buffer.from(
  JSON.stringify({ sub: 'user_123', email: 'a@b.com', name: 'A' }),
).toString('base64url')}.sig`

describe('/api/claim-anon-sessions route', () => {
  beforeEach(() => {
    convexMutation.mockReset()
  })

  it('registers a POST handler at /api/claim-anon-sessions', async () => {
    const { Route } = await import('./claim-anon-sessions')
    const route = Route as unknown as RouteWithHandlers
    expect(route.path).toBe('/api/claim-anon-sessions')
    expect(typeof route.options.server.handlers.POST).toBe('function')
  })

  it('returns 401 when no bearer token is provided', async () => {
    const { Route } = await import('./claim-anon-sessions')
    const route = Route as unknown as RouteWithHandlers
    const res = await route.options.server.handlers.POST({
      request: requestWithBearer(null),
    })
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      error: 'Authentication required to claim anonymous sessions.',
    })
    expect(convexMutation).not.toHaveBeenCalled()
  })

  it('returns 200 with the claim result on success', async () => {
    convexMutation.mockResolvedValue({ claimed: 3 })
    const { Route } = await import('./claim-anon-sessions')
    const route = Route as unknown as RouteWithHandlers
    const res = await route.options.server.handlers.POST({
      request: requestWithBearer(VALID_JWT),
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ claimed: 3 })
  })

  it('returns 401 when convex rejects the token as AUTH_REQUIRED', async () => {
    const authError = new Error(
      'Uncaught ConvexError: {"code":"AUTH_REQUIRED","message":"Sign in to claim anonymous sessions"}',
    )
    convexMutation.mockRejectedValue(authError)
    const { Route } = await import('./claim-anon-sessions')
    const route = Route as unknown as RouteWithHandlers
    const res = await route.options.server.handlers.POST({
      request: requestWithBearer(VALID_JWT),
    })
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toMatch(/Authentication required/)
  })

  it('returns 401 on invalid/expired JWT transport error (HTTPError)', async () => {
    // The convex-browser client throws a plain HTTPError when the bearer
    // token is rejected by Convex auth — no ConvexError payload.
    convexMutation.mockRejectedValue(new Error('HTTPError'))
    const { Route } = await import('./claim-anon-sessions')
    const route = Route as unknown as RouteWithHandlers
    const res = await route.options.server.handlers.POST({
      request: requestWithBearer('fake.token.here'),
    })
    // HTTPError alone is ambiguous; the route must not crash to 500.
    // It maps to the generic upstream-failure path (502) since there is
    // no AUTH_REQUIRED code to confirm it is an auth failure.
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).toMatch(/Failed to claim anonymous sessions/)
  })

  it('returns 401 when convex throws a structured AUTH_REQUIRED ConvexError', async () => {
    const authError = Object.assign(new Error('auth required'), {
      data: { code: 'AUTH_REQUIRED', message: 'Sign in to claim' },
    })
    convexMutation.mockRejectedValue(authError)
    const { Route } = await import('./claim-anon-sessions')
    const route = Route as unknown as RouteWithHandlers
    const res = await route.options.server.handlers.POST({
      request: requestWithBearer(VALID_JWT),
    })
    expect(res.status).toBe(401)
  })

  it('returns 403 when convex throws FORBIDDEN (server-secret mismatch)', async () => {
    const forbiddenError = Object.assign(new Error('forbidden'), {
      data: {
        code: 'FORBIDDEN',
        message: 'This operation can only be called from the server.',
      },
    })
    convexMutation.mockRejectedValue(forbiddenError)
    const { Route } = await import('./claim-anon-sessions')
    const route = Route as unknown as RouteWithHandlers
    const res = await route.options.server.handlers.POST({
      request: requestWithBearer(VALID_JWT),
    })
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/only be called from the server/)
  })

  it('returns 502 (never 500) on unexpected upstream errors', async () => {
    convexMutation.mockRejectedValue(new Error('convex is down'))
    const { Route } = await import('./claim-anon-sessions')
    const route = Route as unknown as RouteWithHandlers
    const res = await route.options.server.handlers.POST({
      request: requestWithBearer(VALID_JWT),
    })
    expect(res.status).toBe(502)
    expect(res.status).not.toBe(500)
    const body = await res.json()
    expect(body.error).toMatch(/Failed to claim anonymous sessions/)
  })
})
