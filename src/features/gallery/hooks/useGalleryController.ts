import { useQuery } from 'convex/react'

import { api } from '../../../../convex/_generated/api'

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
