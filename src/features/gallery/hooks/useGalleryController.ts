import { useQuery } from '@tanstack/react-query'

import { api } from '../../../../convex/_generated/api'
import { createAnonymousClientId } from '@/features/session/services/session-create-payload'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

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
  const { data: gallery } = useQuery({
    queryKey: ['gallery', 'public', { category, limit, page, search }],
    queryFn: async () => {
      const client = createRuntimeConvexHttpClient()
      return await client.query(api.sessions.listPublicSessions, {
        limit,
        page,
        search: search || undefined,
        category: category || undefined,
      })
    },
    staleTime: 5 * 60 * 1000,
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
  const { data: gallery } = useQuery({
    queryKey: [
      'gallery',
      'owned',
      { anonymousClientId, category, limit, page, search },
    ],
    enabled: anonymousClientId !== undefined,
    queryFn: async () => {
      const client = createRuntimeConvexHttpClient()
      return await client.query(api.sessions.listOwnedSessions, {
        anonymousClientId,
        category,
        limit,
        page,
        search,
      })
    },
    staleTime: 5 * 60 * 1000,
  })

  return {
    gallery,
    sessions: gallery?.items,
  }
}

export function getOwnedAnonymousClientId(): string {
  return createAnonymousClientId(window.localStorage)
}
