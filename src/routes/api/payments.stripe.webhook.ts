import { createFileRoute } from '@tanstack/react-router'

import { createWebhookApiResponse } from '@/features/billing/server/webhook-api-response'

// Alias for the webhook URL configured in the Stripe dashboard
// (`/api/payments/stripe/webhook`). Delegates to the same handler as the
// canonical `/api/stripe/webhook` so dashboard-registered events don't 404.
export const Route = createFileRoute('/api/payments/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) =>
        await createWebhookApiResponse(request, 'stripe'),
    },
  },
})
