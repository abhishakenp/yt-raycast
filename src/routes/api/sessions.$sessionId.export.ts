import { createFileRoute } from '@tanstack/react-router'

import { createSessionExportResponse } from '@/features/exports/server/export-api-response'

export const Route = createFileRoute('/api/sessions/$sessionId/export')({
  server: {
    handlers: {
      POST: async ({
        params,
        request,
      }: {
        params: { sessionId: string }
        request: Request
      }) => await createSessionExportResponse(params.sessionId, request),
    },
  },
})
