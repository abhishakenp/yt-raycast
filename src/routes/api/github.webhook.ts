import { createFileRoute } from '@tanstack/react-router'

import { createGitHubWebhookResponse } from '@/features/github/server/github-webhook-response'

export const Route = createFileRoute('/api/github/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => await createGitHubWebhookResponse(request),
    },
  },
})
