import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/api/sessions/$sessionId/download/$target',
)({
  server: {
    handlers: {
      GET: async ({
        params,
        request,
      }: {
        params: { sessionId: string; target: string }
        request: Request
      }) => {
        const { createSessionDownloadResponse } =
          await import('@/features/exports/server/export-api-response')
        return await createSessionDownloadResponse(
          params.sessionId,
          params.target,
          request,
        )
      },
    },
  },
})
