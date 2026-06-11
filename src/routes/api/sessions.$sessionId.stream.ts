import { createFileRoute } from '@tanstack/react-router'

import { createSessionEventStreamResponse } from '@/features/session/server/session-event-stream-route'

export const Route = createFileRoute('/api/sessions/$sessionId/stream')({
  server: {
    handlers: {
      GET: async ({
        params,
        request,
      }: {
        params: { sessionId: string }
        request: Request
      }) => await createSessionEventStreamResponse(params.sessionId, request),
    },
  },
})
