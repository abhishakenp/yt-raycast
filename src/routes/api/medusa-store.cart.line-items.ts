import { createFileRoute } from '@tanstack/react-router'

import { createLegacyMedusaLineItemResponse } from '@/features/commerce/server/commerce-gateway-compatibility'

export const Route = createFileRoute('/api/medusa-store/cart/line-items')({
  server: {
    handlers: {
      POST: async ({ request }) =>
        await createLegacyMedusaLineItemResponse(request),
    },
  },
})
