import { createFileRoute } from '@tanstack/react-router'

import { createCheckoutApiResponse } from '@/features/billing/server/checkout-api-response'

export const Route = createFileRoute('/api/payments/$gateway/start')({
  server: {
    handlers: {
      POST: async ({ request, params }) =>
        await createCheckoutApiResponse(
          request,
          process.env,
          undefined,
          params.gateway,
        ),
    },
  },
})
