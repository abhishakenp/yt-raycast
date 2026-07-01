import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type SessionConvexClient = Pick<ConvexHttpClient, 'query'>

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

export const createSessionApiResponse = async (
  sessionId: string,
  clientOverride?: SessionConvexClient,
): Promise<Response> => {
  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    const data = await client.query(api.sessions.getSessionApiResponse, {
      lookup: sessionId,
    })

    if (data === null) {
      return json({ error: 'Session not found' }, { status: 404 })
    }

    return json(data, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=300',
      },
    })
  } catch {
    return json({ error: 'Unable to load session.' }, { status: 503 })
  }
}
