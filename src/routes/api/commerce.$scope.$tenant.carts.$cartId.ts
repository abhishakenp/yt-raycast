import { createFileRoute } from '@tanstack/react-router'

import { handleCommerceGatewayRequest } from '@/features/commerce/server/commerce-gateway-response'

export const Route = createFileRoute(
  '/api/commerce/$scope/$tenant/carts/$cartId',
)({
  server: {
    handlers: {
      GET: async ({ params, request }) =>
        await handleCommerceGatewayRequest({
          operation: { cartId: params.cartId, type: 'get-cart' },
          request,
          scope: params.scope,
          tenant: params.tenant,
        }),
      PATCH: async ({ params, request }) =>
        await handleCommerceGatewayRequest({
          operation: { cartId: params.cartId, type: 'update-cart' },
          request,
          scope: params.scope,
          tenant: params.tenant,
        }),
    },
  },
})
