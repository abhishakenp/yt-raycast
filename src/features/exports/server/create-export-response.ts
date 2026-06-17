import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import type { ExportTarget } from '../services/openui-export-types'

type ExportConvexClient = Pick<ConvexHttpClient, 'query'> &
  Partial<Pick<ConvexHttpClient, 'setAuth'>>

const normalizeTarget = (target: string): ExportTarget | null => {
  if (target === 'html' || target === 'react' || target === 'next')
    return target
  if (target === 'nextjs') return 'next'
  return null
}

const createDownloadHeaders = (contentType: string, filename: string) => ({
  'content-type': contentType,
  'content-disposition': `attachment; filename="${filename}"`,
})

const toResponseBody = (body: string | Uint8Array): BodyInit => {
  if (typeof body === 'string') return body
  return body.buffer.slice(
    body.byteOffset,
    body.byteOffset + body.byteLength,
  ) as ArrayBuffer
}

const isExportConvexClient = (
  value: Request | ExportConvexClient | undefined,
): value is ExportConvexClient => value !== undefined && 'query' in value

const readExportThemeOptions = (request?: Request) => {
  if (!request) return {}
  const url = new URL(request.url)
  const themeName = url.searchParams.get('theme')?.trim() || undefined
  const mode = url.searchParams.get('mode')?.trim().toLowerCase()

  return {
    themeName,
    isDark: mode === 'dark' ? true : mode === 'light' ? false : undefined,
  }
}

const getBearerToken = (request: Request): string | null => {
  const auth = request.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

const getOwnerSecret = (request?: Request): string | undefined => {
  if (!request) return undefined
  const url = new URL(request.url)
  return (
    request.headers.get('x-ship-fast-owner-secret') ??
    url.searchParams.get('anonymousOwnerSecret') ??
    url.searchParams.get('anonOwnerSecret') ??
    undefined
  )
}

const setClientAuth = (client: ExportConvexClient, request?: Request) => {
  if (!request) return
  const token = getBearerToken(request)
  if (token !== null) client.setAuth?.(token)
}

const errorStatus = (error: unknown): number => {
  const message = error instanceof Error ? error.message : String(error)
  if (/FORBIDDEN|own/i.test(message)) return 403
  if (/AUTH_REQUIRED|Sign in/i.test(message)) return 401
  if (/NOT_FOUND|Validator: v\.id\("sessions"\)/i.test(message)) return 404
  if (/EXPORT_STALE|stale/i.test(message)) return 409
  if (/PAYMENT_REQUIRED|Subscribe|purchase/i.test(message)) return 402
  return 500
}

const textErrorResponse = (error: unknown) =>
  new Response(
    error instanceof Error ? error.message : 'Export failed. Please try again.',
    {
      status: errorStatus(error),
      headers: { 'content-type': 'text/plain' },
    },
  )

export const createExportResponse = async (
  sessionId: string,
  target: string,
  requestOrClient?: Request | ExportConvexClient,
  clientOverride?: ExportConvexClient,
): Promise<Response> => {
  const normalizedTarget = normalizeTarget(target)
  if (normalizedTarget === null) {
    return new Response('Unsupported export target', {
      status: 400,
      headers: { 'content-type': 'text/plain' },
    })
  }

  try {
    const client = isExportConvexClient(requestOrClient)
      ? requestOrClient
      : (clientOverride ?? createRuntimeConvexHttpClient())
    const request = isExportConvexClient(requestOrClient)
      ? undefined
      : requestOrClient
    setClientAuth(client, request)
    const download = await client.query(api.sessions.getOwnedExportDownload, {
      sessionId: sessionId as any,
      target: normalizedTarget,
      anonymousOwnerSecret: getOwnerSecret(request),
    })

    if (download === null) {
      return new Response('Export not found. Generate the export first.', {
        status: 404,
        headers: { 'content-type': 'text/plain' },
      })
    }

    const exportRecord = download.export
    if (
      exportRecord.status === 'payment_required' ||
      exportRecord.requiresPayment === true
    ) {
      return new Response(
        exportRecord.errorMessage ??
          'Subscribe to Pro or purchase download credits to export ZIP files.',
        {
          status: 402,
          headers: { 'content-type': 'text/plain' },
        },
      )
    }

    if (exportRecord.status !== 'ready') {
      return new Response('Export is not ready yet', {
        status: 202,
        headers: { 'content-type': 'text/plain' },
      })
    }

    const source = download.source
    if (typeof source !== 'string' || source.trim().length === 0) {
      return new Response('OpenUI source not found', {
        status: 404,
        headers: { 'content-type': 'text/plain' },
      })
    }

    if (
      exportRecord.previewVersion !== undefined &&
      download.latestPreviewVersion !== undefined &&
      exportRecord.previewVersion !== download.latestPreviewVersion
    ) {
      return new Response('Export is stale. Regenerate the export first.', {
        status: 409,
        headers: { 'content-type': 'text/plain' },
      })
    }

    const exportInput = {
      source,
      siteSpecJson: download.siteSpecJson,
      previewHtml: download.previewHtml,
      sessionId,
      target: normalizedTarget,
      includeBadge: exportRecord.requiresPayment !== false,
      ...readExportThemeOptions(request),
    }
    const exportResult =
      normalizedTarget === 'html'
        ? await (
            await import('../services/openui-html-export-builder')
          ).buildOpenUIHtmlExport(exportInput)
        : await (
            await import('../services/openui-export-builder')
          ).buildOpenUIExport(exportInput)

    return new Response(toResponseBody(exportResult.body), {
      headers: createDownloadHeaders(
        exportResult.contentType,
        exportResult.filename,
      ),
    })
  } catch (error) {
    console.error('[export]', error)
    return textErrorResponse(error)
  }
}
