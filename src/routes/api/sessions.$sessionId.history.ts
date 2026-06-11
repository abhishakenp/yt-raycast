import { createFileRoute } from '@tanstack/react-router'

import { createPreviewHistoryResponse } from '@/features/session/server/session-preview-edit-response'

export const Route = createFileRoute('/api/sessions/$sessionId/history')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { sessionId: string } }) =>
        await createPreviewHistoryResponse(params.sessionId),
    },
  },
})
