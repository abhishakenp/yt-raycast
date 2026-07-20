import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/export/$sessionId/$target')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const { createExportResponse } =
          await import('@/features/exports/server/create-export-response')
        return await createExportResponse(
          params.sessionId,
          params.target,
          request,
        )
      },
    },
  },
})
