import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type HealthConvexClient = {
  query: (reference: unknown, args: Record<string, unknown>) => Promise<unknown>
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      ...init?.headers,
    },
  })
}

export async function createHealthApiResponse(
  clientOverride?: HealthConvexClient,
  timeoutMs = 5000,
): Promise<Response> {
  const startedAt = Date.now()
  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    const { api } = await import('../../../../convex/_generated/api')
    await Promise.race([
      client.query(api.sessions.listPublicSessions, { limit: 1 }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('convex timeout')), timeoutMs),
      ),
    ])
    return json({
      ok: true,
      convex: 'reachable',
      latencyMs: Date.now() - startedAt,
    })
  } catch (error) {
    const message =
      error instanceof Error && error.message === 'convex timeout'
        ? 'convex timeout'
        : 'Dependency health check failed.'
    return json(
      {
        ok: false,
        convex: 'unreachable',
        latencyMs: Date.now() - startedAt,
        error: message,
      },
      { status: 503 },
    )
  }
}
