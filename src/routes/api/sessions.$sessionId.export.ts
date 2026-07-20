import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/sessions/$sessionId/export')({
  server: {
    handlers: {
      POST: async ({
        params,
        request,
      }: {
        params: { sessionId: string }
        request: Request
      }) => {
        const { createSessionExportResponse } =
          await import('@/features/exports/server/export-api-response')
        return await createSessionExportResponse(params.sessionId, request)
      },
    },
  },
})
