import { createFileRoute } from '@tanstack/react-router'

import { createAgentationSessionResponse } from '@/features/agentation/server/agentation-sync-response'

export const Route = createFileRoute('/api/agentation-sync/sessions')({
  server: {
    handlers: {
      POST: async ({ request }) =>
        await createAgentationSessionResponse(request),
    },
  },
})
