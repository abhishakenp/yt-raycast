import { createFileRoute } from '@tanstack/react-router'

import { createPartnerAttributionApiResponse } from '@/features/partners/server/partner-api-response'

export const Route = createFileRoute('/api/partners/attribution')({
  server: {
    handlers: {
      POST: async ({ request }) =>
        await createPartnerAttributionApiResponse(request),
    },
  },
})
