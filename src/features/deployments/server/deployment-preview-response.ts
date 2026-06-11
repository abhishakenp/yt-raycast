import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
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
  const [deployment, preview] = await Promise.all([
    client.query(api.sessions.getDeploymentBySlug, { slug: normalizedSlug }),
    client.query(api.sessions.getPublicPreview, { lookup: normalizedSlug }),
  ])

  if (deployment === null || deployment.status !== 'ready') {
    return new Response('Deployment not found', {
      status: 404,
      headers: { 'content-type': 'text/plain' },
    })
  }

  if (preview === null || preview.html === undefined) {
    return new Response('Deployment preview is not ready yet', {
      status: 202,
      headers: { 'content-type': 'text/plain' },
    })
  }

  const html = buildHtmlExport(preview.html, {
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
