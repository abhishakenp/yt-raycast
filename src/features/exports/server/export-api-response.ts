import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { createExportResponse } from './create-export-response'

type ExportApiClient = Pick<ConvexHttpClient, 'query' | 'mutation'> &
  Partial<Pick<ConvexHttpClient, 'setAuth'>>
type ExportTarget = 'html' | 'react' | 'next' | 'lakebed'
type ExportRecord = {
  status?: string
  requiresPayment?: boolean
  fileCount?: number | null
  previewVersion?: number | null
  downloadUrl?: string | null
  githubUrl?: string | null
  url?: string | null
  deployedUrl?: string | null
  artifact?: {
    status?: string
    fileCount?: number | null
    errorMessage?: string
  } | null
}

const EXPORT_TARGETS: ExportTarget[] = ['html', 'react', 'next', 'lakebed']

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

const targetLabel = (target: ExportTarget): string =>
  target === 'html'
    ? 'HTML'
    : target === 'react'
      ? 'React'
      : target === 'next'
        ? 'Next.js'
        : 'Lakebed'

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

const isUnsupportedExportTargetError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error)
  return /Path: \.target/i.test(message) && /Validator: v\.union/i.test(message)
}

const loadExportRecordForTarget = async (
  client: ExportApiClient,
  sessionId: string,
  target: ExportTarget,
): Promise<ExportRecord | null> => {
  try {
    return (await client.query(api.sessions.getExport, {
      sessionId: sessionId as never,
      target,
    })) as ExportRecord | null
  } catch (error) {
    if (isUnsupportedExportTargetError(error)) return null
    throw error
  }
}

export const createExportTargetsResponse = async (
  sessionId: string,
  clientOverride?: ExportApiClient,
): Promise<Response> => {
  try {
    const client = createClient(clientOverride)
    const view = await client.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })
    const session = view?.session
    if (session === undefined || session === null) {
      return json({
        sessionId,
        previewReady: false,
        isPrivate: null,
        targets: [],
      })
    }

    const normalizedSessionId =
      typeof session._id === 'string' ? session._id : sessionId
    const previewReady = session.status === 'preview_ready'
    const currentPreviewVersion =
      typeof session.previewVersion === 'number'
        ? session.previewVersion
        : null

    const targets = await Promise.all(
      EXPORT_TARGETS.map(async (target) => {
        const record = await loadExportRecordForTarget(
          client,
          normalizedSessionId,
          target,
        )
        const artifact = record?.artifact ?? null
        const isStale =
          record?.previewVersion !== undefined &&
          record.previewVersion !== null &&
          currentPreviewVersion !== null &&
          record.previewVersion !== currentPreviewVersion
        const ready = record?.status === 'ready' && !isStale
        const artifactStatus =
          artifact?.status ?? (ready ? 'ready' : previewReady ? 'queued' : 'not_ready')
        const artifactReady = artifactStatus === 'ready' || ready

        return {
          target,
          label: targetLabel(target),
          ready,
          status: isStale
            ? 'stale'
            : (record?.status ?? (previewReady ? 'available' : 'not_ready')),
          requiresPayment: record?.requiresPayment ?? false,
          fileCount: record?.fileCount ?? artifact?.fileCount ?? null,
          previewVersion: record?.previewVersion ?? null,
          currentPreviewVersion,
          downloadUrl: ready
            ? (record?.downloadUrl ??
              `/api/sessions/${encodeURIComponent(sessionId)}/download/${target}`)
            : null,
          githubUrl: record?.githubUrl ?? record?.url ?? null,
          githubRepoUrl: record?.githubUrl ?? record?.url ?? null,
          deployedUrl: record?.deployedUrl ?? null,
          artifact,
          artifactReady,
          artifactStatus,
          artifactError: artifact?.errorMessage,
        }
      }),
    )

    return json({
      sessionId,
      previewReady,
      isPrivate: session.isPrivate ?? null,
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
        { error: 'Export target must be html, react, next, or lakebed.' },
        { status: 400 },
      )
    }

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
