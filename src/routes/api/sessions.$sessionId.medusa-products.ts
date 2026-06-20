import { createFileRoute } from '@tanstack/react-router'

import { createSessionMedusaProductsResponse } from '@/features/commerce/server/medusa-product-read'

export const Route = createFileRoute(
  '/api/sessions/$sessionId/medusa-products',
)({
  server: {
    handlers: {
      GET: async ({ params }: { params: { sessionId: string } }) =>
        await createSessionMedusaProductsResponse(params.sessionId, {
          env: process.env,
          fetch,
          metaEnv: {},
        }),
    },
  },
})
