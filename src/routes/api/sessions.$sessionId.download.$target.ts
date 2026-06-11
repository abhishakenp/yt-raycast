import { createFileRoute } from '@tanstack/react-router'

import { createSessionDownloadResponse } from '@/features/exports/server/export-api-response'

export const Route = createFileRoute('/api/sessions/$sessionId/download/$target')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { sessionId: string; target: string } }) =>
        await createSessionDownloadResponse(params.sessionId, params.target),
    },
  },
})
