import { createFileRoute } from '@tanstack/react-router'

import { createWebhookApiResponse } from '@/features/billing/server/webhook-api-response'

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) =>
        await createWebhookApiResponse(request, 'stripe'),
    },
  },
})
