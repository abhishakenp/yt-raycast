import { createFileRoute } from '@tanstack/react-router'

import { createLakebedPublishResponse } from '@/features/deployments/server/lakebed-publish-response'

export const Route = createFileRoute('/api/sessions/$sessionId/deploy/lakebed')(
  {
    server: {
      handlers: {
        POST: async ({ request, params }) =>
          await createLakebedPublishResponse(request, params.sessionId),
      },
    },
  },
)
