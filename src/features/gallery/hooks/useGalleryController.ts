import { useQuery } from 'convex/react'

import { api } from '../../../../convex/_generated/api'
import { createAnonymousClientId } from '@/features/session/services/session-create-payload'

export type GalleryQueryOptions = {
  category?: string
  limit?: number
  page?: number
  search?: string
}

export const useGalleryController = ({
  category = '',
  limit = 12,
  page = 1,
  search = '',
}: GalleryQueryOptions = {}) => {
  const gallery = useQuery(api.sessions.listPublicSessions, {
    category,
    limit,
    page,
    search,
  })

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
