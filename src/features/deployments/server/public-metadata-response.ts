import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import {
  createLlmsTxt,
  createRobotsTxt,
  createSitemapXml,
  extractExportMetadata,
  normalizeSiteUrl,
} from '@/features/exports/services/html-export-files'
import {
  BASE_DOMAIN,
  HOME_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/lib/site-config'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type PublicMetadataKind = 'llms' | 'robots' | 'sitemap'
type PublicMetadataClient = Pick<ConvexHttpClient, 'query'>

type PublicMetadataOptions = {
  slug?: string
  client?: PublicMetadataClient
}

const RESERVED_HOST_LABELS = new Set([
  'admin',
  'api',
  'app',
  'assets',
  'cdn',
  'convex',
  'dashboard',
  'www',
])

const contentTypes: Record<PublicMetadataKind, string> = {
  llms: 'text/plain; charset=utf-8',
  robots: 'text/plain; charset=utf-8',
  sitemap: 'application/xml; charset=utf-8',
}

const responseHeaders = (kind: PublicMetadataKind): HeadersInit => ({
  'cache-control': 'public, max-age=60, stale-while-revalidate=300',
  'content-type': contentTypes[kind],
})

const normalizeSlug = (value: string | undefined): string | undefined => {
  const slug = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
  return slug || undefined
}

const requestHostname = (request: Request): string => {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const rawHost = forwardedHost ?? new URL(request.url).host
  return rawHost.split(',')[0]?.trim().split(':')[0]?.toLowerCase() ?? ''
}

export const getDeploymentSlugFromRequest = (
  request: Request,
): string | undefined => {
  const hostname = requestHostname(request)
  const baseDomain = BASE_DOMAIN.toLowerCase().replace(/^\.+|\.+$/g, '')
  if (!hostname || !baseDomain) return undefined
  if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
    return undefined
  }
  if (!hostname.endsWith(`.${baseDomain}`)) return undefined

  const label = hostname.slice(0, -1 * `.${baseDomain}`.length)
  if (!label || label.includes('.') || RESERVED_HOST_LABELS.has(label)) {
    return undefined
  }

  return normalizeSlug(label)
}

const createAppLlmsTxt = (): string =>
  `# ${SITE_NAME}\n\n> ${HOME_DESCRIPTION}\n\n- Site URL: ${SITE_URL}/\n- Primary page: /\n- Public gallery: /gallery\n- Pricing: /pricing\n- Generated deployments expose robots.txt, sitemap.xml, and llms.txt metadata from their published preview.\n`

const createAppSitemapXml = (): string => {
  const pages = ['/', '/gallery', '/pricing', '/privacy', '/terms']
  const body = pages
    .map((path) => `  <url>\n    <loc>${SITE_URL}${path}</loc>\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

const appMetadataBody = (kind: PublicMetadataKind): string => {
  if (kind === 'robots') return createRobotsTxt(SITE_URL)
  if (kind === 'sitemap') return createAppSitemapXml()
  return createAppLlmsTxt()
}

const deploymentMetadataBody = (
  kind: PublicMetadataKind,
  siteUrl: string,
  previewHtml: string,
): string => {
  if (kind === 'robots') return createRobotsTxt(siteUrl)
  if (kind === 'sitemap') return createSitemapXml(siteUrl)
  return createLlmsTxt(siteUrl, extractExportMetadata(previewHtml))
}

export const createPublicMetadataResponse = async (
  kind: PublicMetadataKind,
  request: Request,
  options: PublicMetadataOptions = {},
): Promise<Response> => {
  const slug =
    normalizeSlug(options.slug) ?? getDeploymentSlugFromRequest(request)

  if (slug === undefined) {
    return new Response(appMetadataBody(kind), {
      headers: responseHeaders(kind),
    })
  }

  const client = options.client ?? createRuntimeConvexHttpClient()
  let deployment: Awaited<ReturnType<typeof client.query>>
  let preview: Awaited<ReturnType<typeof client.query>>
  try {
    ;[deployment, preview] = await Promise.all([
      client.query(api.sessions.getDeploymentBySlug, { slug }),
      client.query(api.sessions.getPublicPreview, { lookup: slug }),
    ])
  } catch {
    return new Response('Deployment metadata is unavailable', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  if (deployment === null || deployment.status !== 'ready') {
    return new Response('Deployment metadata not found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  const previewHtml = typeof preview?.html === 'string' ? preview.html : ''

  if (
    preview === null ||
    preview.html === undefined ||
    typeof preview.html !== 'string' ||
    previewHtml.trim() === '' ||
    isUnsafePublicPreviewHtml(previewHtml)
  ) {
    return new Response(
      isUnsafePublicPreviewHtml(previewHtml)
        ? 'Deployment metadata is not available'
        : 'Deployment metadata is not ready yet',
      {
        status: isUnsafePublicPreviewHtml(previewHtml) ? 422 : 202,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      },
    )
  }

  if (
    typeof deployment.previewVersion === 'number' &&
    typeof preview.previewVersion === 'number' &&
    preview.previewVersion > deployment.previewVersion
  ) {
    return new Response('Deployment metadata is not ready yet', {
      status: 202,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  if (
    typeof deployment.sessionId === 'string' &&
    typeof preview.sessionId === 'string' &&
    preview.sessionId !== deployment.sessionId
  ) {
    return new Response('Deployment metadata is not available', {
      status: 422,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  const siteUrl =
    normalizeSiteUrl(deployment.url) ??
    `https://${deployment.slug}.${BASE_DOMAIN}`

  return new Response(deploymentMetadataBody(kind, siteUrl, previewHtml), {
    headers: {
      ...responseHeaders(kind),
      'x-ship-fast-deployment': deployment.slug,
      'x-ship-fast-preview-version': String(preview.previewVersion ?? ''),
    },
  })
}
