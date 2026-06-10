import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { getRuntimeConvexUrl } from '@/shared/env/convex-runtime'
import { buildHtmlExport } from '../services/html-export-builder'

const htmlHeaders = {
  'content-type': 'text/html; charset=utf-8',
  'content-disposition': 'attachment; filename="index.html"',
}

export const createExportResponse = async (
  sessionId: string,
  target: 'html' | 'react' | 'next',
): Promise<Response> => {
  if (target !== 'html') {
    return new Response('Only HTML export is currently supported', {
      status: 400,
      headers: { 'content-type': 'text/plain' },
    })
  }

  try {
    const client = new ConvexHttpClient(getRuntimeConvexUrl())
    const exportRecord = await client.query(api.sessions.getExport, {
      sessionId: sessionId as any,
      target,
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

    const preview = await client.query(api.sessions.getPublicPreview, {
      lookup: sessionId,
    })

    if (preview === null || preview.html === undefined) {
      return new Response('Preview not found', {
        status: 404,
        headers: { 'content-type': 'text/plain' },
      })
    }

    const exportHtml = buildHtmlExport(preview.html, { includeBadge: true })

    return new Response(exportHtml, {
      headers: htmlHeaders,
    })
  } catch {
    return new Response('Export failed. Please try again.', {
      status: 500,
      headers: { 'content-type': 'text/plain' },
    })
  }
}
