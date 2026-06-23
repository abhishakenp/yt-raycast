import { createFileRoute } from '@tanstack/react-router'

import { createWebhookApiResponse } from '@/features/billing/server/webhook-api-response'

// Alias for the webhook URL configured in the Razorpay dashboard
// (`/api/payments/razorpay/webhook`). Delegates to the same handler as the
// canonical `/api/razorpay/webhook` so dashboard-registered events don't 404.
export const Route = createFileRoute('/api/payments/razorpay/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) =>
        await createWebhookApiResponse(request, 'razorpay'),
    },
  },
})
