import { createFileRoute } from '@tanstack/react-router'

import { createCheckoutApiResponse } from '@/features/billing/server/checkout-api-response'

export const Route = createFileRoute('/api/checkout/start')({
  server: {
    handlers: {
      POST: async ({ request }) => await createCheckoutApiResponse(request),
    },
  },
})
