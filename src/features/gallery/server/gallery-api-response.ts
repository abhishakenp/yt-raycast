import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type GalleryConvexClient = Pick<ConvexHttpClient, 'query'>

const GALLERY_PAGE_DEFAULT = 12
const GALLERY_PAGE_MAX = 24
const galleryHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=20, stale-while-revalidate=120',
}

export const parseGalleryPagination = (query: Record<string, string> = {}) => {
  let valid = true

  const limitRaw = parseInt(String(query.limit ?? ''), 10)
  let limit: number
  if (query.limit === undefined || String(query.limit).trim() === '') {
    limit = GALLERY_PAGE_DEFAULT
  } else if (Number.isNaN(limitRaw)) {
    valid = false
    limit = GALLERY_PAGE_DEFAULT
  } else if (limitRaw === 0) {
    limit = GALLERY_PAGE_DEFAULT
  } else if (limitRaw < 0) {
    valid = false
    limit = GALLERY_PAGE_DEFAULT
  } else {
    limit = Math.min(limitRaw, GALLERY_PAGE_MAX)
  }

  const pageRaw = parseInt(String(query.page ?? ''), 10)
  let page: number
  if (query.page === undefined || String(query.page).trim() === '') {
    page = 1
  } else if (Number.isNaN(pageRaw)) {
    valid = false
    page = 1
  } else if (pageRaw === 0) {
    page = 1
  } else if (pageRaw < 0) {
    valid = false
    page = 1
  } else {
    page = pageRaw
  }

  return { limit, page, valid }
}

const emptyGalleryPayload = (page: number, limit: number) => ({
  items: [],
  page,
  limit,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  availableCategories: [],
})

export const createGalleryApiResponse = async (
  request: Request,
  clientOverride?: GalleryConvexClient,
) => {
  const url = new URL(request.url)
  const { limit, page, valid } = parseGalleryPagination(
    Object.fromEntries(url.searchParams),
  )

  if (!valid) {
    return new Response(
      JSON.stringify({ error: 'Invalid pagination parameters' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

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
      headers: galleryHeaders,
    })
  } catch {
    return new Response(JSON.stringify(emptyGalleryPayload(page, limit)), {
      status: 200,
      headers: galleryHeaders,
    })
  }
}
