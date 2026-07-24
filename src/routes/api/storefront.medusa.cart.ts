import { createFileRoute } from '@tanstack/react-router'

import { createLegacyMedusaCartResponse } from '@/features/commerce/server/commerce-gateway-compatibility'

export const Route = createFileRoute('/api/storefront/medusa/cart')({
  server: {
    handlers: {
      POST: async () => await createLegacyMedusaCartResponse(),
    },
  },
})
