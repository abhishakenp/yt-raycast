import { createFileRoute } from '@tanstack/react-router'

import { handleCommerceGatewayRequest } from '@/features/commerce/server/commerce-gateway-response'

export const Route = createFileRoute(
  '/api/commerce/$scope/$tenant/carts/$cartId/items/$lineId',
)({
  server: {
    handlers: {
      DELETE: async ({ params, request }) =>
        await handleCommerceGatewayRequest({
          operation: {
            cartId: params.cartId,
            lineId: params.lineId,
            type: 'remove-item',
          },
          request,
          scope: params.scope,
          tenant: params.tenant,
        }),
      PATCH: async ({ params, request }) =>
        await handleCommerceGatewayRequest({
          operation: {
            cartId: params.cartId,
            lineId: params.lineId,
            type: 'update-item',
          },
          request,
          scope: params.scope,
          tenant: params.tenant,
        }),
    },
  },
})
