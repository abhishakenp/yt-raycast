import { createFileRoute } from '@tanstack/react-router'

import { createSessionPreviewRawResponse } from '@/features/session/server/session-preview-raw-response'

export const Route = createFileRoute('/api/sessions/$sessionId/preview-raw')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { sessionId: string } }) =>
        await createSessionPreviewRawResponse(params.sessionId),
    },
  },
})
