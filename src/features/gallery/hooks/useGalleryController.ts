import { useEffect, useMemo, useState } from 'react'

import type { GalleryPayload } from '@/features/gallery/components/PublicGallery'

export type GalleryQueryOptions = {
  category?: string
  limit?: number
  page?: number
  search?: string
}

export type GalleryThumbnailSession = {
  sessionId: string
  previewVersion?: number
}

const normalizeGalleryParam = (value: string | number | undefined): string =>
  String(value ?? '').trim()

const emptyGalleryPayload = (page: number, limit: number): GalleryPayload => ({
  items: [],
  page,
  limit,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  availableCategories: [],
})

const GALLERY_PAYLOAD_CACHE_TTL_MS = 30_000
const GALLERY_THUMBNAIL_CACHE_TTL_MS = 5 * 60_000

const galleryPayloadCache = new Map<
  string,
  { payload: GalleryPayload; createdAt: number }
>()
const galleryPayloadRequests = new Map<string, Promise<GalleryPayload>>()
const galleryThumbnailCache = new Map<
  string,
  { objectUrl: string; createdAt: number }
>()
const galleryThumbnailRequests = new Map<string, Promise<string | undefined>>()

const fetchGalleryPayload = async (
  requestUrl: string,
  page: number,
  limit: number,
): Promise<GalleryPayload> => {
  const cached = galleryPayloadCache.get(requestUrl)
  if (cached && Date.now() - cached.createdAt < GALLERY_PAYLOAD_CACHE_TTL_MS) {
    return cached.payload
  }

  const pending = galleryPayloadRequests.get(requestUrl)
  if (pending) return pending

  const request = fetch(requestUrl, {
    headers: { accept: 'application/json' },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`gallery ${response.status}`)
      return (await response.json()) as GalleryPayload
    })
    .catch(() => emptyGalleryPayload(page, limit))
    .then((payload) => {
      galleryPayloadCache.set(requestUrl, { payload, createdAt: Date.now() })
      return payload
    })
    .finally(() => {
      galleryPayloadRequests.delete(requestUrl)
    })

  galleryPayloadRequests.set(requestUrl, request)
  return request
}

const buildGalleryRequestUrl = ({
  category = '',
  limit = 12,
  page = 1,
  search = '',
}: GalleryQueryOptions = {}): string => {
  const params = new URLSearchParams()
  params.set('limit', normalizeGalleryParam(limit))
  params.set('page', normalizeGalleryParam(page))
  const normalizedCategory = normalizeGalleryParam(category)
  const normalizedSearch = normalizeGalleryParam(search)
  if (normalizedCategory) params.set('category', normalizedCategory)
  if (normalizedSearch) params.set('search', normalizedSearch)
  return `/api/sessions/recent?${params.toString()}`
}

export const getGalleryThumbnailUrl = ({
  previewVersion,
  sessionId,
}: GalleryThumbnailSession): string => {
  const version = encodeURIComponent(String(previewVersion ?? 0))
  return `/api/sessions/${encodeURIComponent(sessionId)}/gallery-thumb?v=${version}`
}

export const resolveGalleryThumbnail = async (
  thumbnailUrl: string,
): Promise<string | undefined> => {
  const cached = galleryThumbnailCache.get(thumbnailUrl)
  if (
    cached &&
    Date.now() - cached.createdAt < GALLERY_THUMBNAIL_CACHE_TTL_MS
  ) {
    return cached.objectUrl
  }

  if (cached) {
    URL.revokeObjectURL(cached.objectUrl)
    galleryThumbnailCache.delete(thumbnailUrl)
  }

  const pending = galleryThumbnailRequests.get(thumbnailUrl)
  if (pending) return pending

  const request = fetch(thumbnailUrl)
    .then(async (response) => {
      if (!response.ok) throw new Error(`thumbnail ${response.status}`)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      galleryThumbnailCache.set(thumbnailUrl, {
        objectUrl,
        createdAt: Date.now(),
      })
      return objectUrl
    })
    .catch(() => undefined)
    .finally(() => {
      galleryThumbnailRequests.delete(thumbnailUrl)
    })

  galleryThumbnailRequests.set(thumbnailUrl, request)
  return request
}

export const prewarmGalleryPayload = (
  options: GalleryQueryOptions = {},
): Promise<GalleryPayload> => {
  const { limit = 12, page = 1 } = options
  return fetchGalleryPayload(buildGalleryRequestUrl(options), page, limit)
}

export const prewarmGalleryThumbnails = async (
  gallery: GalleryPayload,
  limit = gallery.items.length,
): Promise<void> => {
  await Promise.all(
    gallery.items
      .slice(0, limit)
      .map((session) =>
        resolveGalleryThumbnail(getGalleryThumbnailUrl(session)),
      ),
  )
}

export const useGalleryController = ({
  category = '',
  limit = 12,
  page = 1,
  search = '',
}: GalleryQueryOptions = {}) => {
  const [gallery, setGallery] = useState<GalleryPayload | undefined>()

  const requestUrl = useMemo(
    () => buildGalleryRequestUrl({ category, limit, page, search }),
    [category, limit, page, search],
  )

  useEffect(() => {
    let cancelled = false

    const loadGallery = async () => {
      const data = await fetchGalleryPayload(requestUrl, page, limit)
      if (!cancelled) setGallery(data)
    }

    setGallery(undefined)
    void loadGallery()

    return () => {
      cancelled = true
    }
  }, [limit, page, requestUrl])

  return {
    gallery,
    sessions: gallery?.items,
  }
}
