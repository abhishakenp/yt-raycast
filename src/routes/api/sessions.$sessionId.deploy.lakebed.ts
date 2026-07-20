import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/sessions/$sessionId/deploy/lakebed')(
  {
    server: {
      handlers: {
        POST: async ({ request, params }) => {
          const { createLakebedPublishResponse } =
            await import('@/features/deployments/server/lakebed-publish-response')
          return await createLakebedPublishResponse(request, params.sessionId)
        },
      },
    },
  },
)
