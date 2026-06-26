import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type GalleryConvexClient = Pick<ConvexHttpClient, 'query'>

const GALLERY_PAGE_DEFAULT = 12
const GALLERY_PAGE_MAX = 24

export const parseGalleryPagination = (query: Record<string, string> = {}) => {
  const limitRaw = parseInt(String(query.limit ?? ''), 10)
  const pageRaw = parseInt(String(query.page ?? ''), 10)
  const limit = Math.min(
    Math.max(Number.isFinite(limitRaw) ? limitRaw : GALLERY_PAGE_DEFAULT, 1),
    GALLERY_PAGE_MAX,
  )
  const page = Math.max(Number.isFinite(pageRaw) ? pageRaw : 1, 1)
  return { limit, page }
}

export const createGalleryApiResponse = async (
  request: Request,
  clientOverride?: GalleryConvexClient,
) => {
  const url = new URL(request.url)
  const { limit, page } = parseGalleryPagination(
    Object.fromEntries(url.searchParams),
  )
  // Support "query" as an alias for "search" for recent-session compatibility
  const search =
    url.searchParams.get('search') ?? url.searchParams.get('query') ?? undefined
  const category = url.searchParams.get('category') ?? undefined

  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    const data = await client.query(api.sessions.listPublicSessions, {
      limit,
      page,
      search,
      category,
    })

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=20, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Unable to load gallery',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
