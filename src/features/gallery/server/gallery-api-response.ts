import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { isOpenUiErrorHtml } from '../../../../convex/lib/openui_error_html'
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

    const rawItems = data?.items ?? []
    const filteredItems = rawItems.filter(
      (item) => !isOpenUiErrorHtml(item?.html),
    )
    // When renderer-error previews are suppressed, recompute the pagination
    // totals so the public payload reflects only the visible items.
    const suppressedCount = rawItems.length - filteredItems.length
    const total =
      suppressedCount > 0 ? filteredItems.length : (data?.total ?? 0)
    const totalPages =
      suppressedCount > 0
        ? Math.max(1, Math.ceil(total / limit))
        : (data?.totalPages ?? 1)
    const hasNext =
      suppressedCount > 0 ? page < totalPages : (data?.hasNext ?? false)
    const hasPrev = suppressedCount > 0 ? page > 1 : (data?.hasPrev ?? false)
    const sanitized = {
      ...data,
      items: filteredItems,
      total,
      totalPages,
      hasNext,
      hasPrev,
    }

    return new Response(JSON.stringify(sanitized), {
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
