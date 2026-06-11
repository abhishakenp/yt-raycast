import { createFileRoute } from '@tanstack/react-router'

import { createInlineStyleEditResponse } from '@/features/session/server/session-preview-edit-response'

export const Route = createFileRoute(
  '/api/sessions/$sessionId/preview-inline-style',
)({
  server: {
    handlers: {
      POST: async ({
        params,
        request,
      }: {
        params: { sessionId: string }
        request: Request
      }) => await createInlineStyleEditResponse(params.sessionId, request),
    },
  },
})
