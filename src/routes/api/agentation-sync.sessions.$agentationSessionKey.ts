import { createFileRoute } from '@tanstack/react-router'

import { getAgentationSessionResponse } from '@/features/agentation/server/agentation-sync-response'

export const Route = createFileRoute('/api/agentation-sync/sessions/$agentationSessionKey')({
  server: {
    handlers: {
      GET: async ({ params }) =>
        await getAgentationSessionResponse(params.agentationSessionKey),
    },
  },
})
