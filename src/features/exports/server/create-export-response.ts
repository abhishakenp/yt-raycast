import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { getRuntimeConvexUrl } from '@/shared/env/convex-runtime'
import { buildOpenUIExport, type ExportTarget } from '../services/openui-export-builder'

const normalizeTarget = (target: string): ExportTarget | null => {
  if (target === 'html' || target === 'react' || target === 'next') return target
  if (target === 'nextjs') return 'next'
  return null
}

const createDownloadHeaders = (contentType: string, filename: string) => ({
  'content-type': contentType,
  'content-disposition': `attachment; filename="${filename}"`,
})

const toResponseBody = (body: string | Uint8Array): BodyInit => {
  if (typeof body === 'string') return body
  return body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer
}

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

export const createExportResponse = async (
  sessionId: string,
  target: string,
  request?: Request,
): Promise<Response> => {
  const normalizedTarget = normalizeTarget(target)
  if (normalizedTarget === null) {
    return new Response('Unsupported export target', {
      status: 400,
      headers: { 'content-type': 'text/plain' },
    })
  }

  try {
    const client = new ConvexHttpClient(getRuntimeConvexUrl())
    const exportRecord = await client.query(api.sessions.getExport, {
      sessionId: sessionId as any,
      target: normalizedTarget,
    })

    if (exportRecord === null) {
      return new Response('Export not found. Generate the export first.', {
        status: 404,
        headers: { 'content-type': 'text/plain' },
      })
    }

    if (exportRecord.status !== 'ready') {
      return new Response('Export is not ready yet', {
        status: 202,
        headers: { 'content-type': 'text/plain' },
      })
    }

    const generationView = await client.query(api.sessions.getGenerationView, {
      lookup: sessionId,
    })

    const source = generationView?.homeModule?.source
    if (generationView === null || typeof source !== 'string' || source.trim().length === 0) {
      return new Response('OpenUI source not found', {
        status: 404,
        headers: { 'content-type': 'text/plain' },
      })
    }

    const exportResult = buildOpenUIExport({
      source,
      siteSpecJson: generationView.siteSpec?.specJson,
      previewHtml: generationView.latestPreview?.html,
      sessionId,
      target: normalizedTarget,
      ...readExportThemeOptions(request),
    })

    return new Response(toResponseBody(exportResult.body), {
      headers: createDownloadHeaders(exportResult.contentType, exportResult.filename),
    })
  } catch (error) {
    console.error('[export]', error)
    return new Response('Export failed. Please try again.', {
      status: 500,
      headers: { 'content-type': 'text/plain' },
    })
  }
}
