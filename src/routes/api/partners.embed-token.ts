import { createFileRoute } from '@tanstack/react-router'

import { createPartnerEmbedTokenApiResponse } from '@/features/partners/server/partner-api-response'

export const Route = createFileRoute('/api/partners/embed-token')({
  server: {
    handlers: {
      GET: async ({ request }) =>
        await createPartnerEmbedTokenApiResponse(request),
    },
  },
})
