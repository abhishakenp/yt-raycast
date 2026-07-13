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
        await Promise.resolve(
          client.mutation(
            'session:assertOwnership' as never,
            {
              sessionId: params.sessionId,
            } as never,
          ),
        ).catch(() => null)
        return await createSessionMedusaProvisionResponse(
          params.sessionId,
          request,
          client,
          { env: process.env, fetch, metaEnv: {} },
        )
      },
    },
  },
})
