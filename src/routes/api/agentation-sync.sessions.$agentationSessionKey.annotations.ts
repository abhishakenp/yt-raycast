import { createFileRoute } from '@tanstack/react-router'

import { createAgentationAnnotationResponse } from '@/features/agentation/server/agentation-sync-response'

export const Route = createFileRoute(
  '/api/agentation-sync/sessions/$agentationSessionKey/annotations',
)({
  server: {
    handlers: {
      POST: async ({ params, request }) =>
        await createAgentationAnnotationResponse(
          params.agentationSessionKey,
          request,
        ),
    },
  },
})
