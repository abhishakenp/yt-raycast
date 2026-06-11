import { createFileRoute } from '@tanstack/react-router'

import { createSessionApiResponse } from '@/features/session/server/session-api-response-route'

export const Route = createFileRoute('/api/sessions/$sessionId')({
  server: {
    handlers: {
      GET: async ({ params }) => await createSessionApiResponse(params.sessionId),
    },
  },
})
