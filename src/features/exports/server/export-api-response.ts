import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { createExportResponse } from './create-export-response'

type ExportApiClient = Pick<ConvexHttpClient, 'query' | 'mutation'> &
  Partial<Pick<ConvexHttpClient, 'setAuth'>>
type ExportTarget = 'html' | 'react' | 'next' | 'lakebed'

const isJsonObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const readJsonBody = async (
  request: Request,
): Promise<Record<string, unknown>> => {
  const text = await request.text()
  if (!text.trim()) return {}
  const parsed: unknown = JSON.parse(text)
  return isJsonObject(parsed) ? parsed : {}
}

const normalizeTarget = (value: unknown): ExportTarget | null => {
  switch (value) {
    case 'html':
    case 'react':
    case 'next':
    case 'lakebed':
      return value
    default:
      return null
  }
}

const getOwnerSecret = (
  request: Request,
  body: Record<string, unknown>,
): string | undefined => {
  const bodySecret = body.anonymousOwnerSecret ?? body.anonOwnerSecret
  return typeof bodySecret === 'string'
    ? bodySecret
    : (request.headers.get('x-ship-fast-owner-secret') ?? undefined)
}

const createClient = (clientOverride?: ExportApiClient): ExportApiClient =>
  clientOverride ?? createRuntimeConvexHttpClient()

const getBearerToken = (request: Request): string | null => {
  const auth = request.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

const setClientAuth = (client: ExportApiClient, request: Request) => {
  const token = getBearerToken(request)
  if (token !== null) client.setAuth?.(token)
}

export const createSessionExportResponse = async (
  sessionId: string,
  request: Request,
  clientOverride?: ExportApiClient,
): Promise<Response> => {
  let body: Record<string, unknown>
  try {
    body = await readJsonBody(request)
  } catch {
    return json({ error: 'Invalid export request.' }, { status: 400 })
  }

  const target = normalizeTarget(body.target ?? body.exportTarget)
  if (target === null) {
    return json(
      { error: 'Export target must be html, react, next, or lakebed.' },
      { status: 400 },
    )
  }

  try {
    const client = createClient(clientOverride)
    setClientAuth(client, request)
    const result = await client.mutation(api.sessions.createExportByLookup, {
      lookup: sessionId,
      target,
      anonymousOwnerSecret: getOwnerSecret(request, body),
    })

    return json({
      ...result,
      downloadUrl: `/api/sessions/${sessionId}/download/${target}`,
    })
  } catch {
    return json({ error: 'Export request failed.' }, { status: 503 })
  }
}

export const createSessionDownloadResponse = async (
  sessionId: string,
  target: string,
  requestOrClient?: Request | ExportApiClient,
): Promise<Response> => {
  const normalizedTarget = normalizeTarget(target)
  if (normalizedTarget === null) {
    return new Response('Unsupported export target', {
      status: 400,
      headers: { 'content-type': 'text/plain' },
    })
  }

  return await createExportResponse(
    sessionId,
    normalizedTarget,
    requestOrClient,
  )
}
