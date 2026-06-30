import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type DeleteGallerySessionInput = {
  anonymousClientId: string
  sessionId: string
}

type DeleteGallerySessionResult = {
  deleted: number
}

export const deleteGallerySession = async ({
  anonymousClientId,
  sessionId,
}: DeleteGallerySessionInput): Promise<DeleteGallerySessionResult> => {
  const client = createRuntimeConvexHttpClient()
  return await client.mutation(api.sessions.deleteMine, {
    anonymousClientId,
    sessionId: sessionId as Id<'sessions'>,
  })
}
