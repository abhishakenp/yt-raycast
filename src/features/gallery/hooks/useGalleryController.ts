import { useQuery } from 'convex/react'

import { api } from '../../../../convex/_generated/api'
import { createAnonymousClientId } from '@/features/session/services/session-create-payload'

export type GalleryQueryOptions = {
  category?: string
  limit?: number
  page?: number
  search?: string
}

export function useGalleryController({
  category = '',
  limit = 12,
  page = 1,
  search = '',
}: GalleryQueryOptions = {}) {
  const gallery = useQuery(api.sessions.listPublicSessions, {
    limit,
    page,
    search: search || undefined,
    category: category || undefined,
  })

  return {
    gallery,
    sessions: gallery?.items,
  }
}

export type OwnedGalleryQueryOptions = GalleryQueryOptions & {
  anonymousClientId?: string
}

export function useOwnedGalleryController({
  category = '',
  limit = 12,
  page = 1,
  search = '',
  anonymousClientId,
}: OwnedGalleryQueryOptions = {}) {
  const gallery = useQuery(
    api.sessions.listOwnedSessions,
    anonymousClientId !== undefined
      ? {
          anonymousClientId,
          category: category || undefined,
          limit,
          page,
          search: search || undefined,
        }
      : 'skip',
  )

  return {
    gallery,
    sessions: gallery?.items,
  }
}

export function getOwnedAnonymousClientId(): string {
  return createAnonymousClientId(window.localStorage)
}
