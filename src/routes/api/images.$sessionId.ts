import { createFileRoute } from '@tanstack/react-router'

import { createGalleryPreviewImageResponse } from '@/features/gallery/server/gallery-preview-image-response'

export const Route = createFileRoute('/api/images/$sessionId')({
  server: {
    handlers: {
      GET: async ({
        params,
        request,
      }: {
        params: { sessionId: string }
        request: Request
      }) => {
        const cacheVersion = new URL(request.url).searchParams.get('v')
        return await createGalleryPreviewImageResponse(params.sessionId, {
          cacheVersion,
        })
      },
    },
  },
})
