import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { getRuntimeConvexUrl } from '@/shared/env/convex-runtime'

const htmlHeaders = {
  'content-type': 'text/html; charset=utf-8',
}

const renderPreviewStatusHtml = (title: string, message: string): string =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head><body style="font-family:Inter,system-ui,sans-serif;margin:0;min-height:100vh;display:grid;place-items:center;background:#030511;color:#e5eefc"><main style="max-width:560px;padding:32px;text-align:center"><h1 style="font-size:32px;margin:0 0 12px">${title}</h1><p style="color:#9fb1d1;line-height:1.6">${message}</p></main></body></html>`

export const createPublicPreviewResponse = async (lookup: string): Promise<Response> => {
  const client = new ConvexHttpClient(getRuntimeConvexUrl())
  const preview = await client.query(api.sessions.getPublicPreview, {
    lookup,
  })

  if (preview === null) {
    return new Response(renderPreviewStatusHtml('Preview not found', 'This preview is unavailable or private.'), {
      headers: htmlHeaders,
      status: 404,
    })
  }

  if (preview.html === undefined) {
    return new Response(renderPreviewStatusHtml('Preview is not ready', 'Generation is still running. Refresh shortly.'), {
      headers: {
        ...htmlHeaders,
        'cache-control': 'no-store',
      },
      status: 202,
    })
  }

  return new Response(preview.html, {
    headers: {
      ...htmlHeaders,
      'cache-control': 'public, max-age=30',
    },
  })
}
