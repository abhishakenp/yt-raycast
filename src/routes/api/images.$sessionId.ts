import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/images/$sessionId')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { sessionId: string } }) => {
        const { createGalleryPreviewImageResponse } =
          await import('@/features/gallery/server/gallery-preview-image-response')
        return await createGalleryPreviewImageResponse(params.sessionId)
      },
    },
  },
})
