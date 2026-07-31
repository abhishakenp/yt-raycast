import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import {
  getClientIp,
  hashClientIp,
} from '@/features/session/server/session-create-response'
import {
  sendBusinessNotification,
  userRegisteredEvent,
} from '@/features/notifications/slack-business'

// ConvexError carries structured data in .data (e.g. {code, message}). The
// convex-browser client also throws plain Error/HTTPError for transport or
// auth failures. Extract a {code, message} payload either way.
function convexErrorPayload(
  error: unknown,
): { code?: string; message?: string } | null {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data: unknown }).data
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const payload = data as Record<string, unknown>
      return {
        code: typeof payload.code === 'string' ? payload.code : undefined,
        message:
          typeof payload.message === 'string' ? payload.message : undefined,
      }
    }
  }
  const message = error instanceof Error ? error.message : String(error)
  const match = message.match(/\{.*\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0]) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }
    const payload = parsed as Record<string, unknown>
    return {
      code: typeof payload.code === 'string' ? payload.code : undefined,
      message:
        typeof payload.message === 'string' ? payload.message : undefined,
    }
  } catch {
    return null
  }
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

function getBearerToken(request: Request): string | null {
  const match = (request.headers.get('authorization') ?? '').match(
    /^Bearer\s+(.+)$/i,
  )
  return match?.[1]?.trim() || null
}

// Link all anonymous sessions on the caller's IP to their signed-in userId.
// The clientIpHash is derived server-side from request headers (unforgeable),
// and the userId comes from the Clerk JWT (also unforgeable). This replaces the
// old localStorage-based claim (forgeable anonymousClientId) for /mine ownership
// across the anon→authenticated transition. Quota counting does not depend on
// this — loadGenerationAdmission counts the union of IP + userId buckets
// directly.
async function claimAnonymousSessions(request: Request) {
  const token = getBearerToken(request)
  if (token === null) {
    return json(
      { error: 'Authentication required to claim anonymous sessions.' },
      { status: 401 },
    )
  }

  const clientIp = getClientIp(request)
  const clientIpHash = hashClientIp(clientIp)
  const client = createRuntimeConvexHttpClient()
  client.setAuth(token)
  let result
  try {
    result = await client.mutation(
      api.sessions.claimAnonymousSessionsByIpMutation,
      { clientIpHash, secret: process.env.SHARE_BONUS_MUTATION_SECRET },
    )
  } catch (error) {
    const payload = convexErrorPayload(error)
    const code = payload?.code
    const message =
      payload?.message ?? (error instanceof Error ? error.message : undefined)

    // AUTH_REQUIRED: convex rejected the bearer token (missing/invalid/
    // expired Clerk JWT) or getUserId() returned undefined.
    if (
      code === 'AUTH_REQUIRED' ||
      message?.includes('AuthenticationRequired') ||
      message?.includes('Unauthenticated') ||
      message?.includes('Invalid token')
    ) {
      return json(
        { error: 'Authentication required to claim anonymous sessions.' },
        { status: 401 },
      )
    }
    // FORBIDDEN: server-secret mismatch — the mutation is server-only.
    if (code === 'FORBIDDEN') {
      return json(
        { error: 'This operation can only be called from the server.' },
        { status: 403 },
      )
    }
    // Anything else is an upstream Convex failure — surface as 502, never
    // an unhandled 500 (which signals the API itself crashed).
    return json(
      { error: 'Failed to claim anonymous sessions. Try again.' },
      { status: 502 },
    )
  }

  // Best-effort Slack notification — never blocks the response.
  // Extract userId, name, email from the Clerk JWT payload.
  let userId = 'unknown'
  let userName: string | undefined
  let userEmail: string | undefined
  try {
    const payload = token.split('.')[1]
    if (payload) {
      const decoded = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf-8'),
      )
      userId = decoded.sub ?? decoded['https://clerk.com/user_id'] ?? 'unknown'
      userName = decoded.name ?? decoded['https://clerk.com/name']
      userEmail = decoded.email ?? decoded['https://clerk.com/email']
    }
  } catch {}

  void sendBusinessNotification(
    userRegisteredEvent({
      userId,
      userName,
      userEmail,
      ipHash: clientIpHash,
    }),
  ).catch(() => {})

  return json(result)
}

export const Route = createFileRoute('/api/claim-anon-sessions')({
  server: {
    handlers: {
      POST: async ({ request }) => claimAnonymousSessions(request),
    },
  },
})
