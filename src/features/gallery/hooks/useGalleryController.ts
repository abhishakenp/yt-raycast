import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'

import { api } from '../../../../convex/_generated/api'
import { createAnonymousClientId } from '@/features/session/services/session-create-payload'
import type { GalleryPayload } from '@/features/gallery/components/PublicGallery'
import {
  getGalleryThumbnailUrl,
  resolveGalleryThumbnail,
} from './gallery-thumbnail'

export type { GalleryThumbnailSession } from './gallery-thumbnail'
export {
  getGalleryThumbnailUrl,
  resolveGalleryThumbnail,
} from './gallery-thumbnail'

export type GalleryQueryOptions = {
  category?: string
  limit?: number
  page?: number
  search?: string
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

const galleryPayloadCache = new Map<
  string,
  { payload: GalleryPayload; createdAt: number }
>()
const galleryPayloadRequests = new Map<string, Promise<GalleryPayload>>()

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
      const payload = (await response.json()) as GalleryPayload
      if (!payload || !Array.isArray(payload.items)) {
        return emptyGalleryPayload(page, limit)
      }
      return payload
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

export type OwnedGalleryQueryOptions = GalleryQueryOptions & {
  anonymousClientId?: string
}

// "My generations" — lists sessions owned by the caller (signed-in Convex auth
// or the localStorage anonymousClientId), including private ones. Skips the
// query entirely until an anonymousClientId is resolved so anonymous first-time
// visitors don't trigger an empty backend round-trip with no identity.
export const useOwnedGalleryController = ({
  category = '',
  limit = 12,
  page = 1,
  search = '',
  anonymousClientId,
}: OwnedGalleryQueryOptions = {}) => {
  const gallery = useQuery(
    api.sessions.listOwnedSessions,
    anonymousClientId === undefined
      ? 'skip'
      : {
          anonymousClientId,
          category,
          limit,
          page,
          search,
        },
  )

  return {
    gallery,
    sessions: gallery?.items,
  }
}

// Resolve the stable anonymousClientId from localStorage (creating it on first
// call). Used by the /mine page to scope the owned-sessions query for
// not-signed-in visitors.
export const getOwnedAnonymousClientId = (): string =>
  createAnonymousClientId(window.localStorage)
