import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type LakebedPublishClient = Pick<ConvexHttpClient, 'action' | 'query'> &
  Partial<Pick<ConvexHttpClient, 'setAuth'>>

type LakebedPublishBody = {
  anonymousOwnerSecret?: string
}

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })

const getBearerToken = (request: Request): string | null => {
  const auth = request.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

const normalizeError = (error: unknown): string =>
  error instanceof Error ? error.message : 'Lakebed publish failed'

export const createLakebedPublishResponse = async (
  request: Request,
  sessionId: string,
  clientOverride?: LakebedPublishClient,
): Promise<Response> => {
  let body: LakebedPublishBody = {}

  try {
    body = (await request.json()) as LakebedPublishBody
  } catch {
    body = {}
  }

  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient(60_000)
    const token = getBearerToken(request)
    if (token !== null) client.setAuth?.(token)

    const existing = await client.query(api.sessions.getDeploymentStatus, {
      sessionId: sessionId as any,
    })
    if (
      existing?.provider === 'lakebed' &&
      existing.status === 'ready' &&
      typeof existing.url === 'string'
    ) {
      return json(existing)
    }

    const result = await client.action(api.lakebed_deploy.deploy, {
      sessionId: sessionId as any,
      anonymousOwnerSecret: body.anonymousOwnerSecret,
    })

    return json(result)
  } catch (error) {
    console.error('[lakebed_publish]', error)
    return json({ error: normalizeError(error) }, { status: 500 })
  }
}
