import { createFileRoute } from '@tanstack/react-router'

import { createGalleryThumbnailResponse } from '@/features/gallery/server/gallery-thumbnail-response'

export const Route = createFileRoute('/api/sessions/$sessionId/gallery-thumb')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { sessionId: string } }) => {
        return await createGalleryThumbnailResponse(params.sessionId)
      },
    },
  },
})
