import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type DeploymentPreviewClient = Pick<ConvexHttpClient, 'query'>

type DeploymentHtmlArtifact = {
  slug: string
  url: string
  status: string
  previewVersion: number
  sessionId: string
  artifact: {
    status: string
    generatorRevision?: string
    errorMessage?: string
    contentType?: string
    storageUrl: string | null
  } | null
}

const DEPLOYMENT_PREVIEW_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self' https: wss:",
  "font-src 'self' https: data:",
  "form-action 'self' https:",
  "frame-ancestors 'self'",
  "frame-src 'self' https: data:",
  "img-src 'self' https: data: blob:",
  "media-src 'self' https: data: blob:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https:",
  "style-src 'self' 'unsafe-inline' https:",
].join('; ')
const DEPLOYMENT_PREVIEW_TEXT_CONTENT_SECURITY_POLICY =
  "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'"
const DEPLOYMENT_PREVIEW_SECURITY_HEADERS = {
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
} as const

type PlainTextResponseOptions = {
  retryAfterSeconds?: number
}

const createPlainTextResponse = (
  body: string,
  status: number,
  options: PlainTextResponseOptions = {},
): Response =>
  new Response(body, {
    status,
    headers: {
      ...DEPLOYMENT_PREVIEW_SECURITY_HEADERS,
      'cache-control': 'no-store',
      'content-security-policy':
        DEPLOYMENT_PREVIEW_TEXT_CONTENT_SECURITY_POLICY,
      'content-type': 'text/plain',
      ...(options.retryAfterSeconds === undefined
        ? {}
        : { 'retry-after': String(options.retryAfterSeconds) }),
    },
  })

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

function isDeploymentHtmlArtifact(
  value: unknown,
): value is DeploymentHtmlArtifact {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return false
  const record = value as Record<string, unknown>
  if (typeof record.slug !== 'string') return false
  if (typeof record.url !== 'string') return false
  if (typeof record.status !== 'string') return false
  if (typeof record.previewVersion !== 'number') return false
  if (typeof record.sessionId !== 'string') return false
  if (record.artifact !== null && typeof record.artifact === 'object') {
    const artifact = record.artifact as Record<string, unknown>
    if (typeof artifact.status !== 'string') return false
    if (artifact.storageUrl !== null && typeof artifact.storageUrl !== 'string')
      return false
  }
  return true
}

export async function createDeploymentPreviewResponse(
  slug: string,
  _request?: Request,
  clientOverride?: DeploymentPreviewClient,
): Promise<Response> {
  const normalizedSlug = normalizeSlug(slug)

  if (normalizedSlug.length === 0) {
    return createPlainTextResponse('Deployment not found', 404)
  }

  const client = clientOverride ?? createRuntimeConvexHttpClient()
  let deployment: unknown
  try {
    deployment = await client.query(
      api.sessions.getDeploymentHtmlArtifactBySlug,
      { slug: normalizedSlug },
    )
  } catch {
    return createPlainTextResponse('Deployment preview is unavailable', 503, {
      retryAfterSeconds: 5,
    })
  }

  if (!isDeploymentHtmlArtifact(deployment)) {
    return createPlainTextResponse('Deployment not found', 404)
  }

  const artifact = deployment.artifact

  if (artifact === null) {
    return createPlainTextResponse('Deployment preview is not ready yet', 202, {
      retryAfterSeconds: 5,
    })
  }

  if (
    artifact.status === 'queued' ||
    artifact.status === 'building' ||
    artifact.status === 'stale'
  ) {
    return createPlainTextResponse('Deployment preview is not ready yet', 202, {
      retryAfterSeconds: 5,
    })
  }

  if (artifact.status === 'failed') {
    return createPlainTextResponse('Deployment preview is not available', 422)
  }

  if (artifact.status !== 'ready' || !artifact.storageUrl) {
    return createPlainTextResponse('Deployment preview is not ready yet', 202, {
      retryAfterSeconds: 5,
    })
  }

  let artifactResponse: Response
  try {
    artifactResponse = await fetch(artifact.storageUrl)
  } catch {
    return createPlainTextResponse('Deployment preview is unavailable', 503, {
      retryAfterSeconds: 5,
    })
  }

  if (!artifactResponse.ok || artifactResponse.body === null) {
    return createPlainTextResponse('Deployment preview is unavailable', 503, {
      retryAfterSeconds: 5,
    })
  }

  const html = await artifactResponse.text()
  if (html.trim().length === 0) {
    return createPlainTextResponse('Deployment preview is not ready yet', 202, {
      retryAfterSeconds: 5,
    })
  }

  return new Response(html, {
    headers: {
      ...DEPLOYMENT_PREVIEW_SECURITY_HEADERS,
      'cache-control': 'public, max-age=60, stale-while-revalidate=300',
      'content-security-policy': DEPLOYMENT_PREVIEW_CONTENT_SECURITY_POLICY,
      'content-type': 'text/html; charset=utf-8',
      'x-ship-fast-deployment': deployment.slug,
      'x-ship-fast-preview-version': String(deployment.previewVersion),
    },
  })
}
