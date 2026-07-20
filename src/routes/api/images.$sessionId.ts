import { createFileRoute } from '@tanstack/react-router'

import { createGalleryPreviewImageResponse } from '@/features/gallery/server/gallery-preview-image-response'

export const Route = createFileRoute('/api/images/$sessionId')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { sessionId: string } }) => {
        return await createGalleryPreviewImageResponse(params.sessionId)
      },
    },
  },
})
