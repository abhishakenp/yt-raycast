import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import { buildHtmlExport } from '@/features/exports/services/html-export-builder'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type DeploymentPreviewClient = Pick<ConvexHttpClient, 'query'>

const DEPLOYMENT_PREVIEW_CSS_MARKER = 'data-ship-fast-preview-css="1"'
const DEPLOYMENT_PREVIEW_CSS_URL = '/styles/openui-preview-tailwind.css'
const DEPLOYMENT_PREVIEW_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self' https: wss:",
  "font-src 'self' https: data:",
  "form-action 'self' https:",
  "frame-ancestors 'self'",
  "frame-src 'self' https: data:",
  "img-src 'self' https: data: blob:",
  "media-src 'self' https: data: blob:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https:",
  "style-src 'self' 'unsafe-inline' https:",
].join('; ')
const DEPLOYMENT_PREVIEW_TEXT_CONTENT_SECURITY_POLICY =
  "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'"
const DEPLOYMENT_PREVIEW_SECURITY_HEADERS = {
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
} as const

type PlainTextResponseOptions = {
  retryAfterSeconds?: number
}

const createPlainTextResponse = (
  body: string,
  status: number,
  options: PlainTextResponseOptions = {},
): Response =>
  new Response(body, {
    status,
    headers: {
      ...DEPLOYMENT_PREVIEW_SECURITY_HEADERS,
      'cache-control': 'no-store',
      'content-security-policy':
        DEPLOYMENT_PREVIEW_TEXT_CONTENT_SECURITY_POLICY,
      'content-type': 'text/plain',
      ...(options.retryAfterSeconds === undefined
        ? {}
        : { 'retry-after': String(options.retryAfterSeconds) }),
    },
  })

function readDeploymentPreviewCss(): string {
  try {
    return readFileSync(
      join(process.cwd(), 'public', 'styles', 'openui-preview-tailwind.css'),
      'utf8',
    )
  } catch {
    return ''
  }
}

const deploymentPreviewCss = readDeploymentPreviewCss()

function injectDeploymentPreviewCss(html: string): string {
  if (html.includes(DEPLOYMENT_PREVIEW_CSS_MARKER)) return html

  const stylesheet = deploymentPreviewCss
    ? `<style ${DEPLOYMENT_PREVIEW_CSS_MARKER}>${deploymentPreviewCss}</style>`
    : `<link ${DEPLOYMENT_PREVIEW_CSS_MARKER} rel="stylesheet" href="${DEPLOYMENT_PREVIEW_CSS_URL}" />`

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${stylesheet}</head>`)
  }

  return `${stylesheet}${html}`
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

function getRequestCanonicalUrl(
  request: Request | undefined,
  fallbackUrl: string | undefined,
): string | undefined {
  if (fallbackUrl !== undefined) return `${fallbackUrl.replace(/\/+$/, '')}/`
  if (request === undefined) return undefined

  const url = new URL(request.url)
  url.hash = ''
  url.search = ''
  return url.toString()
}

export async function createDeploymentPreviewResponse(
  slug: string,
  request?: Request,
  clientOverride?: DeploymentPreviewClient,
): Promise<Response> {
  const normalizedSlug = normalizeSlug(slug)

  if (normalizedSlug.length === 0) {
    return createPlainTextResponse('Deployment not found', 404)
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
    return createPlainTextResponse('Deployment preview is unavailable', 503, {
      retryAfterSeconds: 5,
    })
  }

  if (deployment === null || deployment.status !== 'ready') {
    return createPlainTextResponse('Deployment not found', 404)
  }

  const previewHtml =
    preview !== null && typeof preview?.html === 'string' ? preview.html : ''

  if (
    preview === null ||
    typeof preview?.html !== 'string' ||
    previewHtml.trim() === '' ||
    isUnsafePublicPreviewHtml(previewHtml)
  ) {
    return createPlainTextResponse(
      isUnsafePublicPreviewHtml(previewHtml)
        ? 'Deployment preview is not available'
        : 'Deployment preview is not ready yet',
      isUnsafePublicPreviewHtml(previewHtml) ? 422 : 202,
      isUnsafePublicPreviewHtml(previewHtml) ? {} : { retryAfterSeconds: 5 },
    )
  }

  if (
    typeof deployment.previewVersion === 'number' &&
    typeof preview.previewVersion === 'number' &&
    preview.previewVersion > deployment.previewVersion
  ) {
    return createPlainTextResponse('Deployment preview is not ready yet', 202, {
      retryAfterSeconds: 5,
    })
  }

  if (
    typeof deployment.sessionId === 'string' &&
    typeof preview.sessionId === 'string' &&
    deployment.sessionId !== preview.sessionId
  ) {
    return createPlainTextResponse('Deployment preview is not available', 422)
  }

  const html = injectDeploymentPreviewCss(
    buildHtmlExport(previewHtml, {
      includeBadge: false,
      canonicalUrl: getRequestCanonicalUrl(request, deployment.url),
    }),
  )

  return new Response(html, {
    headers: {
      ...DEPLOYMENT_PREVIEW_SECURITY_HEADERS,
      'cache-control': 'public, max-age=60, stale-while-revalidate=300',
      'content-security-policy': DEPLOYMENT_PREVIEW_CONTENT_SECURITY_POLICY,
      'content-type': 'text/html; charset=utf-8',
      'x-ship-fast-deployment': deployment.slug,
      'x-ship-fast-preview-version': String(preview.previewVersion ?? ''),
    },
  })
}
