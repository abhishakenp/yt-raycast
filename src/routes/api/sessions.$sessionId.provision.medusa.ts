import { createFileRoute } from '@tanstack/react-router'

import { createSessionMedusaProvisionResponse } from '@/features/commerce/server/commerce-api-response'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

export const Route = createFileRoute(
  '/api/sessions/$sessionId/provision/medusa',
)({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const client = createRuntimeConvexHttpClient()
        return await createSessionMedusaProvisionResponse(
          params.sessionId,
          request,
          client,
          { fetch },
        )
      },
    },
  },
})
