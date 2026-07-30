import { createFileRoute } from '@tanstack/react-router'

import { createLinkFortyWebhookResponse } from '@/features/linkforty/server/linkforty-webhook-response'

export const Route = createFileRoute('/api/linkforty/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) =>
        await createLinkFortyWebhookResponse(request),
    },
  },
})
