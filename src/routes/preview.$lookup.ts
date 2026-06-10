import { createFileRoute } from '@tanstack/react-router'

import { createPublicPreviewResponse } from '@/features/preview/server/public-preview-response'

export const Route = createFileRoute('/preview/$lookup')({
  server: {
    handlers: {
      GET: async ({ params }) => await createPublicPreviewResponse(params.lookup),
    },
  },
})
