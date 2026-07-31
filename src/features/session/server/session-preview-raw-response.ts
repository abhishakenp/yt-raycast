import { api } from '../../../../convex/_generated/api'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import type { PublicGallerySession } from '../../../../convex/lib/session_gallery_helpers'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { buildOpenUIHtmlThumbnail } from '../../exports/services/openui-html-export-builder'

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
      return new Response('Preview not found or not public', { status: 404 })
    }

    const moduleSource = session.moduleSource
    if (moduleSource === null || moduleSource.trim().length === 0) {
      return new Response('Preview not found or not public', { status: 404 })
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
      return new Response('Preview not found or not public', { status: 404 })
    }

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-Robots-Tag': 'noindex',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy':
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; frame-ancestors 'self'",
      },
    })
  } catch {
    return new Response('Preview temporarily unavailable', { status: 503 })
  }
}
