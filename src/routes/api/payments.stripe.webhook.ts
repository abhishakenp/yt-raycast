import { createFileRoute } from '@tanstack/react-router'

import { createWebhookApiResponse } from '@/features/billing/server/webhook-api-response'

// Alias for a `/api/payments/stripe/webhook` dashboard URL (mirrors the
// Razorpay alias); delegates to the same handler as `/api/stripe/webhook`.
export const Route = createFileRoute('/api/payments/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) =>
        await createWebhookApiResponse(request, 'stripe'),
    },
  },
})
