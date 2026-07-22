import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { containsOpenUiHandoffMarkers } from '../../../../convex/lib/openui_error_html'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type LakebedPublishClient = Pick<ConvexHttpClient, 'action' | 'query'> &
  Partial<Pick<ConvexHttpClient, 'setAuth'>>

type LakebedPublishBody = {
  anonymousOwnerSecret?: string
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

function isLakebedPublishBody(value: unknown): value is LakebedPublishBody {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (!('anonymousOwnerSecret' in value) ||
      typeof value.anonymousOwnerSecret === 'string')
  )
}

function isLakebedArtifactStatus(
  value: unknown,
): value is { status?: string; filesUrl?: string | null } {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (!('status' in value) || typeof value.status === 'string') &&
    (!('filesUrl' in value) ||
      typeof value.filesUrl === 'string' ||
      value.filesUrl === null)
  )
}

export async function createLakebedPublishResponse(
  request: Request,
  sessionId: string,
  clientOverride?: LakebedPublishClient,
): Promise<Response> {
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
    if (existing?.provider === 'lakebed' && existing.status === 'failed') {
      return json(
        {
          status: existing.status,
          error: 'Lakebed deployment failed.',
        },
        { status: 500 },
      )
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

    try {
      const filesResponse = await fetch(artifact.filesUrl)
      if (filesResponse.ok) {
        const filesJson = (await filesResponse.json()) as {
          files?: Record<string, string>
        }
        const fileContents = Object.values(filesJson.files ?? {}).join('\n')
        if (containsOpenUiHandoffMarkers(fileContents)) {
          return json(
            { error: 'Export artifact is not a rendered static site.' },
            { status: 409 },
          )
        }
      }
    } catch {
      // Fetch failure is non-fatal; proceed to deploy.
    }

    const result = await client.action(api.lakebed_deploy.deployByLookup, {
      lookup: sessionId,
      anonymousOwnerSecret: body.anonymousOwnerSecret,
    })

    return json(result)
  } catch (error) {
    console.error('[lakebed_publish]', error)
    return json({ error: 'Lakebed publish failed.' }, { status: 500 })
  }
}
