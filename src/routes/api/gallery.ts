import { createFileRoute } from '@tanstack/react-router'

import { createGalleryApiResponse } from '@/features/gallery/server/gallery-api-response'

export const Route = createFileRoute('/api/gallery')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => await createGalleryApiResponse(request),
    },
  },
})
