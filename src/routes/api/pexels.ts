import { createFileRoute } from '@tanstack/react-router'

import { createPexelsPreviewImageResponse } from '@/features/images/server/pexels-preview-image'

export const Route = createFileRoute('/api/pexels')({
  server: {
    handlers: {
      GET: async ({ request }) => createPexelsPreviewImageResponse(request),
    },
  },
})
