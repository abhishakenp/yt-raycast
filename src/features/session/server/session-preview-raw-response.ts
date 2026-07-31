import { api } from '../../../../convex/_generated/api'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import type { PublicGallerySession } from '../../../../convex/lib/session_gallery_helpers'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { buildOpenUIHtmlThumbnail } from '../../exports/services/openui-html-export-builder'

/**
 * This document is generated from user-influenced input and served from the
 * app's own origin, so it is treated as untrusted.
 *
 * `sandbox allow-scripts` (deliberately WITHOUT `allow-same-origin`) drops the
 * document into a unique opaque origin: its inline scripts still run — the
 * thumbnail needs the theme and interaction runtimes, and every storage access
 * in them is already try/catch guarded — but they cannot read `document.cookie`,
 * touch the app's storage, or make credentialed same-origin requests. The old
 * policy allowed `'unsafe-inline'` and `'unsafe-eval'` on the real origin,
 * which meant injected `<script>` / `on*=` handlers executed with full
 * same-origin authority.
 */
const RAW_PREVIEW_CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
  "img-src data: blob: https:",
  "font-src data: https:",
  "style-src 'unsafe-inline' https:",
  "script-src 'unsafe-inline'",
  "object-src 'none'",
  'sandbox allow-scripts',
].join('; ')

const RAW_PREVIEW_SECURITY_HEADERS = {
  'Content-Security-Policy': RAW_PREVIEW_CONTENT_SECURITY_POLICY,
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Robots-Tag': 'noindex',
} as const

/** Error bodies must carry the same headers — a 404 is still attacker-reachable. */
const errorResponse = (body: string, status: number): Response =>
  new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...RAW_PREVIEW_SECURITY_HEADERS,
    },
  })

/**
 * Serve a public session's preview as a standalone HTML document.
 * Used as the screenshot target for gallery thumbnail capture.
 * Renders from OpenUI source (moduleSource) via the HTML export builder.
 * Shares the same PublicGallerySession contract as the gallery preview
 * resolver — serializePublicGallerySession is the single source of truth.
 */
export async function createSessionPreviewRawResponse(
  sessionId: string,
): Promise<Response> {
  try {
    const client = createRuntimeConvexHttpClient()
    const session: PublicGallerySession | null = await client.query(
      api.sessions.getPublicGallerySession,
      { sessionId },
    )

    if (session === null) {
      return errorResponse('Preview not found or not public', 404)
    }

    const moduleSource = session.moduleSource
    if (moduleSource === null || moduleSource.trim().length === 0) {
      return errorResponse('Preview not found or not public', 404)
    }

    const rendered = await buildOpenUIHtmlThumbnail({
      source: moduleSource,
      previewHtml: undefined,
      prompt: session.prompt ?? undefined,
      siteSpecJson: session.siteSpecJson ?? undefined,
      sessionId,
      target: 'html',
      themeName: session.themeOverride ?? session.genuiTheme ?? undefined,
      isDark: session.themeMode !== 'light',
      locale: session.preferredLanguage ?? 'en',
      includeBadge: false,
      selectedBrandLogo: session.selectedBrandLogo ?? null,
    })

    const html =
      typeof rendered.body === 'string'
        ? rendered.body
        : new TextDecoder().decode(rendered.body)

    if (isUnsafePublicPreviewHtml(html)) {
      return errorResponse('Preview not found or not public', 404)
    }

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        // The body varies with the request's encoding negotiation; without
        // Vary a shared cache can hand a compressed body to a client that
        // never asked for one.
        Vary: 'Accept-Encoding',
        ...RAW_PREVIEW_SECURITY_HEADERS,
      },
    })
  } catch {
    return errorResponse('Preview temporarily unavailable', 503)
  }
}
