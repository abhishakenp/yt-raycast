import { createFileRoute } from '@tanstack/react-router'

import { createCheckoutConfirmApiResponse } from '@/features/billing/server/checkout-confirm-api-response'

export const Route = createFileRoute('/api/payments/razorpay/confirm')({
  server: {
    handlers: {
      POST: async ({ request }) =>
        await createCheckoutConfirmApiResponse(request),
    },
  },
})
