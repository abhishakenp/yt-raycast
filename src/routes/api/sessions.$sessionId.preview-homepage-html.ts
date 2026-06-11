import { createFileRoute } from '@tanstack/react-router'

import { createPreviewHtmlSaveResponse } from '@/features/session/server/session-preview-edit-response'

export const Route = createFileRoute(
  '/api/sessions/$sessionId/preview-homepage-html',
)({
  server: {
    handlers: {
      POST: async ({
        params,
        request,
      }: {
        params: { sessionId: string }
        request: Request
      }) => await createPreviewHtmlSaveResponse(params.sessionId, request),
    },
  },
})
