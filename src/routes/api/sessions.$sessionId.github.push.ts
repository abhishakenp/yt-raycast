import { createFileRoute } from '@tanstack/react-router'

import { createGitHubPushResponse } from '@/features/github/server/github-push-response'

export const Route = createFileRoute('/api/sessions/$sessionId/github/push')({
  server: {
    handlers: {
      POST: async ({ request, params }) =>
        await createGitHubPushResponse(request, params.sessionId),
    },
  },
})
