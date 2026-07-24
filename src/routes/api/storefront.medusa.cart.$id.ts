import { createFileRoute } from '@tanstack/react-router'

import { getLegacyMedusaCartResponse } from '@/features/commerce/server/commerce-gateway-compatibility'

export const Route = createFileRoute('/api/storefront/medusa/cart/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => await getLegacyMedusaCartResponse(params.id),
    },
  },
})
