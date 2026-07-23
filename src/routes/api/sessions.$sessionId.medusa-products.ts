import { createFileRoute } from '@tanstack/react-router'

import { createSessionMedusaProductsResponse } from '@/features/commerce/server/medusa-product-read'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

export const Route = createFileRoute(
  '/api/sessions/$sessionId/medusa-products',
)({
  server: {
    handlers: {
      GET: async ({ params }: { params: { sessionId: string } }) => {
        const client = createRuntimeConvexHttpClient()
        return await createSessionMedusaProductsResponse(
          params.sessionId,
          {
            fetch,
          },
          client,
        )
      },
    },
  },
})
