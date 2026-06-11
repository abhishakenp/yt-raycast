import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { createExportResponse } from './create-export-response'

type ExportTarget = 'html' | 'react' | 'next'
type ExportApiClient = Pick<ConvexHttpClient, 'query' | 'mutation'> &
  Partial<Pick<ConvexHttpClient, 'setAuth'>>

const EXPORT_TARGETS: ExportTarget[] = ['html', 'react', 'next']

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
  const parsed = JSON.parse(text) as unknown
  return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {}
}

const normalizeTarget = (value: unknown): ExportTarget | null =>
  typeof value === 'string' && EXPORT_TARGETS.includes(value as ExportTarget)
    ? (value as ExportTarget)
    : null

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

const errorStatus = (error: unknown): number => {
  const message = error instanceof Error ? error.message : String(error)
  if (/FORBIDDEN|own/i.test(message)) return 403
  if (/NOT_FOUND|Validator: v\.id\("sessions"\)/i.test(message)) return 404
  if (/PREVIEW_NOT_READY|NOT_READY/i.test(message)) return 409
  if (/PAYMENT_REQUIRED|Subscribe|purchase/i.test(message)) return 402
  return 500
}

const errorResponse = (error: unknown) =>
  json(
    {
      error: error instanceof Error ? error.message : 'Export request failed',
    },
    { status: errorStatus(error) },
  )

export const createExportTargetsResponse = async (
  sessionId: string,
  clientOverride?: ExportApiClient,
): Promise<Response> => {
  try {
    const client = createClient(clientOverride)
    const view = await client.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    const previewReady = view?.session.status === 'preview_ready'
    const currentPreviewVersion = view?.session.previewVersion
    const targets = await Promise.all(
      EXPORT_TARGETS.map(async (target) => {
        const record = await client.query(api.sessions.getExport, {
          sessionId: sessionId as any,
          target,
        })
        const isStale =
          record?.previewVersion !== undefined &&
          currentPreviewVersion !== undefined &&
          record.previewVersion !== currentPreviewVersion
        const ready = record?.status === 'ready' && !isStale

        return {
          target,
          label:
            target === 'html'
              ? 'HTML'
              : target === 'react'
                ? 'React'
                : 'Next.js',
          ready,
          status: isStale
            ? 'stale'
            : (record?.status ?? (previewReady ? 'available' : 'not_ready')),
          requiresPayment: record?.requiresPayment ?? false,
          fileCount: record?.fileCount ?? null,
          previewVersion: record?.previewVersion ?? null,
          currentPreviewVersion: currentPreviewVersion ?? null,
          downloadUrl: ready
            ? `/api/sessions/${sessionId}/download/${target}`
            : null,
        }
      }),
    )

    return json({
      sessionId,
      previewReady,
      targets,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export const createSessionExportResponse = async (
  sessionId: string,
  request: Request,
  clientOverride?: ExportApiClient,
): Promise<Response> => {
  try {
    const body = await readJsonBody(request)
    const target = normalizeTarget(body.target ?? body.exportTarget)
    if (target === null) {
      return json(
        { error: 'Export target must be html, react, or next.' },
        { status: 400 },
      )
    }

    const client = createClient(clientOverride)
    setClientAuth(client, request)
    const result = await client.mutation(api.sessions.createExport, {
      sessionId: sessionId as any,
      target,
      anonymousOwnerSecret: getOwnerSecret(request, body),
    })

    return json({
      ...result,
      downloadUrl: `/api/sessions/${sessionId}/download/${target}`,
    })
  } catch (error) {
    return errorResponse(error)
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
