import { z } from 'zod'

import { api } from '../../../../convex/_generated/api'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import { createRuntimeConvexHttpClient } from '../../../shared/convex/http-client'
import { buildOpenUIHtmlExport } from '../../exports/services/openui-html-export-builder'

const gallerySessionSchema = z.object({
  html: z.string().nullable(),
  moduleSource: z.string().nullable(),
  siteSpecJson: z.string().nullable().optional(),
  preferredLanguage: z.string().nullable().optional(),
  themeOverride: z.string().nullable().optional(),
  themeMode: z.enum(['light', 'dark']).nullable().optional(),
  genuiTheme: z.string().nullable().optional(),
  selectedBrandLogo: z
    .object({
      name: z.string(),
      domain: z.string().nullable().optional(),
      brandId: z.string().nullable().optional(),
      icon: z.string().nullable().optional(),
      logo: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
})

type GallerySessionData = z.infer<typeof gallerySessionSchema>

export async function resolveGalleryPreviewHtml(
  sessionId: string,
): Promise<string | null> {
  try {
    const client = createRuntimeConvexHttpClient()
    const raw = await client.query(api.sessions.getPublicGallerySession, {
      sessionId,
    })

    if (raw === null) return null

    const session = gallerySessionSchema.parse(raw)

    if (session.moduleSource !== null) {
      return await renderOpenUiHtml(sessionId, session, session.moduleSource)
    }

    if (session.html === null || isUnsafePublicPreviewHtml(session.html)) {
      return null
    }

    return session.html
  } catch {
    return null
  }
}

const renderOpenUiHtml = async (
  sessionId: string,
  session: GallerySessionData,
  source: string,
): Promise<string | null> => {
  try {
    const rendered = await buildOpenUIHtmlExport({
      source,
      previewHtml: undefined,
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
