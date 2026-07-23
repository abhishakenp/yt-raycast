import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import {
  getClientIp,
  hashClientIp,
} from '@/features/session/server/session-create-response'

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

  const clientIpHash = hashClientIp(getClientIp(request))
  const client = createRuntimeConvexHttpClient()
  client.setAuth(token)
  const result = await client.mutation(
    api.sessions.claimAnonymousSessionsByIpMutation,
    { clientIpHash },
  )

  return json(result)
}

export const Route = createFileRoute('/api/claim-anon-sessions')({
  server: {
    handlers: {
      POST: async ({ request }) => claimAnonymousSessions(request),
    },
  },
})
