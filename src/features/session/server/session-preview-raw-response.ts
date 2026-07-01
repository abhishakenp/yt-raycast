import { api } from '../../../../convex/_generated/api'
import { isOpenUiErrorHtml } from '../../../../convex/lib/openui_error_html'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

/**
 * Serve a public session's stored preview HTML as a standalone document.
 * Used as the screenshot target for gallery thumbnail capture.
 */
export const createSessionPreviewRawResponse = async (
  sessionId: string,
): Promise<Response> => {
  try {
    const client = createRuntimeConvexHttpClient()
    const session = await client.query(api.sessions.getPublicGallerySession, {
      sessionId,
    })

    const html = session?.html
    if (typeof html !== 'string' || html.trim().length === 0) {
      return new Response('Preview not found or not public', { status: 404 })
    }

    if (isOpenUiErrorHtml(html)) {
      return new Response('Preview not found or not public', { status: 404 })
    }

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : 'Unable to load preview',
      { status: 500 },
    )
  }
}
