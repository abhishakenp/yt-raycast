import { createFileRoute } from '@tanstack/react-router'

import { createBillingApiResponse } from '@/features/billing/server/billing-api-response'

export const Route = createFileRoute('/api/billing-overview')({
  server: {
    handlers: {
      GET: async ({ request }) =>
        await createBillingApiResponse(request, 'billing-overview'),
    },
  },
})
