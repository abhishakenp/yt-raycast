import { createFileRoute } from '@tanstack/react-router'

import { createInlineTextEditResponse } from '@/features/session/server/session-preview-edit-response'

export const Route = createFileRoute(
  '/api/sessions/$sessionId/preview-inline-text',
)({
  server: {
    handlers: {
      POST: async ({
        params,
        request,
      }: {
        params: { sessionId: string }
        request: Request
      }) => await createInlineTextEditResponse(params.sessionId, request),
    },
  },
})
