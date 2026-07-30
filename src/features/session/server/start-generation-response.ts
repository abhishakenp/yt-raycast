import type { Id } from '../../../../convex/_generated/dataModel'
import { startVpsGeneration } from '@/features/generation/server/vps-generation-handler'

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

function getBearerToken(request: Request): string | null {
  const match = (request.headers.get('authorization') ?? '').match(
    /^Bearer\s+(.+)$/i,
  )
  return match?.[1]?.trim() || null
}

/**
 * Starts VPS generation for an existing session. Used by the dashboard
 * regenerate button after the Convex `regenerateSession` mutation creates
 * the new session. The mutation handles admin-only access control; this
 * route just bridges the Convex-created session to the warm VPS engine.
 */
export async function createStartGenerationResponse(
  request: Request,
  sessionIdParam: string,
): Promise<Response> {
  const sessionId = sessionIdParam as Id<'sessions'>

  try {
    const token = getBearerToken(request)
    const result = await startVpsGeneration({
      sessionId,
      bearerToken: token,
    })

    if (result.status === 'skipped') {
      return json(
        { status: 'skipped', reason: result.reason },
        { status: 200 },
      )
    }

    if (result.status === 'failed') {
      return json(
        { status: 'failed', error: result.message ?? 'Generation failed' },
        { status: 500 },
      )
    }

    return json({ status: 'started', sessionId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed'
    return json({ status: 'failed', error: message }, { status: 500 })
  }
}
