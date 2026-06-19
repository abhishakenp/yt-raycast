import { createFileRoute } from '@tanstack/react-router'

import { createGitHubConnectCallbackResponse } from '@/features/github/server/github-oauth-response'

export const Route = createFileRoute('/api/github/connect/callback')({
  server: {
    handlers: {
      GET: async ({ request }) =>
        await createGitHubConnectCallbackResponse(request),
    },
  },
})
