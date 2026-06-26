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

const isLakebedPublishBody = (value: unknown): value is LakebedPublishBody =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  (!('anonymousOwnerSecret' in value) ||
    typeof value.anonymousOwnerSecret === 'string')

const isLakebedArtifactStatus = (
  value: unknown,
): value is { status?: string; filesUrl?: string | null } =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  (!('status' in value) || typeof value.status === 'string') &&
  (!('filesUrl' in value) ||
    typeof value.filesUrl === 'string' ||
    value.filesUrl === null)

export const createLakebedPublishResponse = async (
  request: Request,
  sessionId: string,
  clientOverride?: LakebedPublishClient,
): Promise<Response> => {
  let body: LakebedPublishBody = {}

  try {
    const parsed = await request.json()
    body = isLakebedPublishBody(parsed) ? parsed : {}
  } catch {
    body = {}
  }

  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient(60_000)
    const token = getBearerToken(request)
    if (token !== null) client.setAuth?.(token)

    const existing = await client.query(
      api.sessions.getDeploymentStatusByLookup,
      {
        lookup: sessionId,
      },
    )
    if (
      existing?.provider === 'lakebed' &&
      existing.status === 'ready' &&
      typeof existing.url === 'string'
    ) {
      return json(existing)
    }

    const artifactResult = await client.query(
      api.sessions.getOwnedLakebedDeploymentArtifactByLookup,
      {
        lookup: sessionId,
        anonymousOwnerSecret: body.anonymousOwnerSecret,
      },
    )
    const artifact = isLakebedArtifactStatus(artifactResult)
      ? artifactResult
      : { status: 'queued', filesUrl: null }
    if (artifact.status !== 'ready' || !artifact.filesUrl) {
      return json(
        {
          status: artifact.status ?? 'queued',
          error: 'Lakebed app is still being prepared.',
        },
        { status: 202 },
      )
    }

    const result = await client.action(api.lakebed_deploy.deployByLookup, {
      lookup: sessionId,
      anonymousOwnerSecret: body.anonymousOwnerSecret,
    })

    return json(result)
  } catch (error) {
    console.error('[lakebed_publish]', error)
    return json({ error: normalizeError(error) }, { status: 500 })
  }
}
