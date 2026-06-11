import { createFileRoute } from '@tanstack/react-router'

import { createChatRefinementResponse } from '@/features/chat/server/chat-refinement-response'

export const Route = createFileRoute('/api/sessions/$sessionId/chat')({
  server: {
    handlers: {
      POST: async ({ request, params }) =>
        await createChatRefinementResponse(params.sessionId, request),
    },
  },
})
