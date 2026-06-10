import { createFileRoute } from '@tanstack/react-router'

import { createExportResponse } from '@/features/exports/server/create-export-response'

export const Route = createFileRoute('/export/$sessionId/$target')({
  server: {
    handlers: {
      GET: async ({ params }) =>
        await createExportResponse(params.sessionId, params.target as 'html' | 'react' | 'next'),
    },
  },
})
