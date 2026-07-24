import { createFileRoute } from '@tanstack/react-router'

import { handleCommerceGatewayRequest } from '@/features/commerce/server/commerce-gateway-response'

export const Route = createFileRoute(
  '/api/commerce/$scope/$tenant/carts/$cartId/payment-providers',
)({
  server: {
    handlers: {
      GET: async ({ params, request }) =>
        await handleCommerceGatewayRequest({
          operation: { cartId: params.cartId, type: 'payment-providers' },
          request,
          scope: params.scope,
          tenant: params.tenant,
        }),
    },
  },
})
