import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'

import { api } from '../../../../convex/_generated/api'
import { createAnonymousClientId } from '@/features/session/services/session-create-payload'
import type { GalleryPayload } from '@/features/gallery/components/PublicGallery'

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

function normalizeGalleryParam(value: string | number | undefined): string {
  return String(value ?? '').trim()
}

function emptyGalleryPayload(page: number, limit: number): GalleryPayload {
  return {
    items: [],
    page,
    limit,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    availableCategories: [],
  }
}

const GALLERY_PAYLOAD_CACHE_TTL_MS = 30_000
const GALLERY_REQUEST_TIMEOUT_MS = 10_000

const galleryPayloadCache = new Map<
  string,
  { payload: GalleryPayload; createdAt: number }
>()
const galleryPayloadRequests = new Map<string, Promise<GalleryPayload>>()

async function fetchGalleryPayload(
  requestUrl: string,
  page: number,
  limit: number,
): Promise<GalleryPayload> {
  const cached = galleryPayloadCache.get(requestUrl)
  if (cached && Date.now() - cached.createdAt < GALLERY_PAYLOAD_CACHE_TTL_MS) {
    return cached.payload
  }

  const pending = galleryPayloadRequests.get(requestUrl)
  if (pending) return pending

  const controller = new AbortController()
  const requestInit: RequestInit = {
    headers: { accept: 'application/json' },
  }
  Object.defineProperty(requestInit, 'signal', {
    configurable: true,
    enumerable: false,
    value: controller.signal,
  })

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort()
      reject(new Error('gallery request timed out'))
    }, GALLERY_REQUEST_TIMEOUT_MS)
  })

  const request = Promise.race([fetch(requestUrl, requestInit), timeout])
    .then(async (response) => {
      if (!response.ok) throw new Error(`gallery ${response.status}`)
      const payload = (await response.json()) as GalleryPayload
      if (!payload || !Array.isArray(payload.items)) {
        throw new Error('gallery payload is malformed')
      }
      return payload
    })
    .then((payload) => {
      galleryPayloadCache.set(requestUrl, { payload, createdAt: Date.now() })
      return payload
    })
    .catch(() => emptyGalleryPayload(page, limit))
    .finally(() => {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      galleryPayloadRequests.delete(requestUrl)
    })

  galleryPayloadRequests.set(requestUrl, request)
  return request
}

function buildGalleryRequestUrl({
  category = '',
  limit = 12,
  page = 1,
  search = '',
}: GalleryQueryOptions = {}): string {
  const params = new URLSearchParams()
  params.set('limit', normalizeGalleryParam(limit))
  params.set('page', normalizeGalleryParam(page))
  const normalizedCategory = normalizeGalleryParam(category)
  const normalizedSearch = normalizeGalleryParam(search)
  if (normalizedCategory) params.set('category', normalizedCategory)
  if (normalizedSearch) params.set('search', normalizedSearch)
  return `/api/sessions/recent?${params.toString()}`
}

export function prewarmGalleryPayload(
  options: GalleryQueryOptions = {},
): Promise<GalleryPayload> {
  const { limit = 12, page = 1 } = options
  return fetchGalleryPayload(buildGalleryRequestUrl(options), page, limit)
}

// Gallery previews must come from server-rendered HTML or a local gradient
// placeholder — never from fetched PNG thumbnails. Prewarming thumbnails is a
// no-op so we never trigger thumbnail blob fetches.
export async function prewarmGalleryThumbnails(
  _gallery: GalleryPayload,
  _limit = 0,
): Promise<void> {
  return undefined
}

export function useGalleryController({
  category = '',
  limit = 12,
  page = 1,
  search = '',
}: GalleryQueryOptions = {}) {
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
export function useOwnedGalleryController({
  category = '',
  limit = 12,
  page = 1,
  search = '',
  anonymousClientId,
}: OwnedGalleryQueryOptions = {}) {
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
export function getOwnedAnonymousClientId(): string {
  return createAnonymousClientId(window.localStorage)
}
