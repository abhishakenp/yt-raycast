import { createFileRoute } from '@tanstack/react-router'

import { createPreviewRestoreResponse } from '@/features/session/server/session-preview-edit-response'

export const Route = createFileRoute(
  '/api/sessions/$sessionId/history/$version/restore',
)({
  server: {
    handlers: {
      POST: async ({
        params,
        request,
      }: {
        params: { sessionId: string; version: string }
        request: Request
      }) =>
        await createPreviewRestoreResponse(
          params.sessionId,
          params.version,
          request,
        ),
    },
  },
})
