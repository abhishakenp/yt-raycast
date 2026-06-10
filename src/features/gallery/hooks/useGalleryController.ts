import { useQuery } from 'convex/react'

import { api } from '../../../../convex/_generated/api'

export const useGalleryController = (limit: number = 20) => {
  const sessions = useQuery(api.sessions.listPublicSessions, { limit })

  return {
    sessions,
  }
}
