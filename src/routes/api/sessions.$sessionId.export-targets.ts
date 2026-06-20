import { createFileRoute } from '@tanstack/react-router'

import { createExportTargetsResponse } from '@/features/exports/server/export-api-response'

export const Route = createFileRoute('/api/sessions/$sessionId/export-targets')(
  {
    server: {
      handlers: {
        GET: async ({ params }: { params: { sessionId: string } }) =>
          await createExportTargetsResponse(params.sessionId),
      },
    },
  },
)

