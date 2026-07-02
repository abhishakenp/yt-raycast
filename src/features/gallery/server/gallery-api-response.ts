import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import { buildOpenUIHtmlExport } from '../../exports/services/openui-html-export-builder'
import type { BrandLogoSelection } from '../../exports/services/openui-export-types'
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

type GalleryApiItem = {
  sessionId?: unknown
  html?: unknown
  moduleSource?: unknown
  siteSpecJson?: unknown
  preferredLanguage?: unknown
  themeOverride?: unknown
  genuiTheme?: unknown
  themeMode?: unknown
  categories?: unknown
  [key: string]: unknown
}

const readString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined

const readGalleryThemeName = (item: GalleryApiItem): string | undefined =>
  readString(item.themeOverride) ?? readString(item.genuiTheme)

const readGalleryIsDark = (item: GalleryApiItem): boolean =>
  item.themeMode !== 'light'

const readSelectedBrandLogo = (
  item: GalleryApiItem,
): BrandLogoSelection | null => {
  const logo = item.selectedBrandLogo
  if (logo === null || typeof logo !== 'object') return null
  const name = readString((logo as Record<string, unknown>).name)
  if (!name) return null
  const icon = readString((logo as Record<string, unknown>).icon)
  const logoUrl = readString((logo as Record<string, unknown>).logo)
  if (!icon && !logoUrl) return null
  return {
    name,
    domain: readString((logo as Record<string, unknown>).domain) ?? null,
    brandId: readString((logo as Record<string, unknown>).brandId) ?? null,
    icon: icon ?? null,
    logo: logoUrl ?? null,
  }
}

const renderGalleryItemStaticHtml = async (
  item: GalleryApiItem,
): Promise<GalleryApiItem | null> => {
  const html = readString(item.html)
  const moduleSource = readString(item.moduleSource)
  const unsafeHtml = isUnsafePublicPreviewHtml(html)

  if (moduleSource === undefined) {
    if (unsafeHtml) return null
    return item
  }

  try {
    const rendered = await buildOpenUIHtmlExport({
      source: moduleSource,
      previewHtml: undefined,
      siteSpecJson: readString(item.siteSpecJson),
      sessionId: readString(item.sessionId) ?? 'gallery-session',
      target: 'html',
      themeName: readGalleryThemeName(item),
      isDark: readGalleryIsDark(item),
      locale: readString(item.preferredLanguage) ?? 'en',
      includeBadge: false,
      selectedBrandLogo: readSelectedBrandLogo(item),
    })
    const body =
      typeof rendered.body === 'string'
        ? rendered.body
        : new TextDecoder().decode(rendered.body)
    if (isUnsafePublicPreviewHtml(body)) return null
    const { imageUrl: _imageUrl, moduleSource: _moduleSource, ...rest } = item
    return { ...rest, html: body }
  } catch {
    // When an OpenUI row has a moduleSource but cannot be rendered to
    // static HTML, drop it entirely rather than forwarding stale preview
    // HTML or a PNG fallback imageUrl.
    return null
  }
}

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

    const rawItems = Array.isArray(data?.items) ? data.items : []
    // Drop malformed public session rows (null entries, non-object shapes,
    // or rows missing a sessionId) before serializing gallery JSON, and
    // suppress renderer-error previews so they never reach the public feed.
    const filteredItems = (
      await Promise.all(
        rawItems.map(async (item) => {
          if (item === null || typeof item !== 'object') return false
          if (typeof item.sessionId !== 'string' || item.sessionId === '')
            return false
          return await renderGalleryItemStaticHtml(item as GalleryApiItem)
        }),
      )
    )
      .filter((item): item is GalleryApiItem => item !== null && item !== false)
      .map((item) => ({
        ...item,
        categories: Array.isArray(item.categories) ? item.categories : [],
      }))
    // Recompute the pagination totals so the public payload reflects only
    // the visible items after dropping malformed/renderer-error rows.
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
