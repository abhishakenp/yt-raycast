import { createFileRoute } from '@tanstack/react-router'

import { handleCommerceGatewayRequest } from '@/features/commerce/server/commerce-gateway-response'

export const Route = createFileRoute('/api/commerce/$scope/$tenant/carts')({
  server: {
    handlers: {
      POST: async ({ params, request }) =>
        await handleCommerceGatewayRequest({
          operation: { type: 'create-cart' },
          request,
          scope: params.scope,
          tenant: params.tenant,
        }),
    },
  },
})
