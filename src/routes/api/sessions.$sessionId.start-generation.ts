import { createFileRoute } from '@tanstack/react-router'

import { createStartGenerationResponse } from '@/features/session/server/start-generation-response'

export const Route = createFileRoute(
  '/api/sessions/$sessionId/start-generation',
)({
  server: {
    handlers: {
      POST: async ({ request, params }) =>
        await createStartGenerationResponse(request, params.sessionId),
    },
  },
})
