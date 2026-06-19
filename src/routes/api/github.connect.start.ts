import { createFileRoute } from '@tanstack/react-router'

import { createGitHubConnectStartResponse } from '@/features/github/server/github-oauth-response'

export const Route = createFileRoute('/api/github/connect/start')({
  server: {
    handlers: {
      POST: async ({ request }) =>
        await createGitHubConnectStartResponse(request),
    },
  },
})
