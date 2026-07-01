import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import { buildHtmlExport } from '@/features/exports/services/html-export-builder'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type DeploymentPreviewClient = Pick<ConvexHttpClient, 'query'>

const normalizeSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)

const getRequestCanonicalUrl = (
  request: Request | undefined,
  fallbackUrl: string | undefined,
): string | undefined => {
  if (fallbackUrl !== undefined) return `${fallbackUrl.replace(/\/+$/, '')}/`
  if (request === undefined) return undefined

  const url = new URL(request.url)
  url.hash = ''
  url.search = ''
  return url.toString()
}

export const createDeploymentPreviewResponse = async (
  slug: string,
  request?: Request,
  clientOverride?: DeploymentPreviewClient,
): Promise<Response> => {
  const normalizedSlug = normalizeSlug(slug)

  if (normalizedSlug.length === 0) {
    return new Response('Deployment not found', {
      status: 404,
      headers: { 'content-type': 'text/plain' },
    })
  }

  const client = clientOverride ?? createRuntimeConvexHttpClient()
  let deployment: Awaited<ReturnType<typeof client.query>>
  let preview: Awaited<ReturnType<typeof client.query>>
  try {
    ;[deployment, preview] = await Promise.all([
      client.query(api.sessions.getDeploymentBySlug, { slug: normalizedSlug }),
      client.query(api.sessions.getPublicPreview, { lookup: normalizedSlug }),
    ])
  } catch {
    return new Response('Deployment preview is unavailable', {
      status: 503,
      headers: { 'content-type': 'text/plain' },
    })
  }

  if (deployment === null || deployment.status !== 'ready') {
    return new Response('Deployment not found', {
      status: 404,
      headers: { 'content-type': 'text/plain' },
    })
  }

  const previewHtml =
    preview !== null && typeof preview?.html === 'string' ? preview.html : ''

  if (
    preview === null ||
    typeof preview?.html !== 'string' ||
    previewHtml.trim() === '' ||
    isUnsafePublicPreviewHtml(previewHtml)
  ) {
    return new Response(
      isUnsafePublicPreviewHtml(previewHtml)
        ? 'Deployment preview is not available'
        : 'Deployment preview is not ready yet',
      {
        status: isUnsafePublicPreviewHtml(previewHtml) ? 422 : 202,
        headers: { 'content-type': 'text/plain' },
      },
    )
  }

  if (
    typeof deployment.previewVersion === 'number' &&
    typeof preview.previewVersion === 'number' &&
    preview.previewVersion > deployment.previewVersion
  ) {
    return new Response('Deployment preview is not ready yet', {
      status: 202,
      headers: { 'content-type': 'text/plain' },
    })
  }

  if (
    typeof deployment.sessionId === 'string' &&
    typeof preview.sessionId === 'string' &&
    deployment.sessionId !== preview.sessionId
  ) {
    return new Response('Deployment preview is not available', {
      status: 422,
      headers: { 'content-type': 'text/plain' },
    })
  }

  const html = buildHtmlExport(previewHtml, {
    includeBadge: false,
    canonicalUrl: getRequestCanonicalUrl(request, deployment.url),
  })

  return new Response(html, {
    headers: {
      'cache-control': 'public, max-age=60, stale-while-revalidate=300',
      'content-type': 'text/html; charset=utf-8',
      'x-ship-fast-deployment': deployment.slug,
      'x-ship-fast-preview-version': String(preview.previewVersion ?? ''),
    },
  })
}
