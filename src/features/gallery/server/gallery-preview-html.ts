import { api } from '../../../../convex/_generated/api'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import type { PublicGallerySession } from '../../../../convex/lib/session_gallery_helpers'
import { createRuntimeConvexHttpClient } from '../../../shared/convex/http-client'
import { buildOpenUIHtmlThumbnail } from '../../exports/services/openui-html-export-builder'

export async function resolveGalleryPreviewHtml(
  sessionId: string,
): Promise<string | null> {
  try {
    const client = createRuntimeConvexHttpClient()
    const raw: PublicGallerySession | null = await client.query(
      api.sessions.getPublicGallerySession,
      { sessionId },
    )

    if (raw === null) return null

    // The Convex serializer (serializePublicGallerySession) is the single
    // source of truth for this shape. v3-only engine always emits moduleSource
    // (OpenUI source) and never a pre-rendered html blob, so we render from
    // source via the same buildOpenUIHtmlExport path the live preview uses.
    if (raw.moduleSource === null) return null

    return await renderOpenUiHtml(sessionId, raw, raw.moduleSource)
  } catch {
    return null
  }
}

const renderOpenUiHtml = async (
  sessionId: string,
  session: PublicGallerySession,
  source: string,
): Promise<string | null> => {
  try {
    const rendered = await buildOpenUIHtmlThumbnail({
      source,
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
    return isUnsafePublicPreviewHtml(html) ? null : html
  } catch {
    return null
  }
}
