import { createFileRoute } from '@tanstack/react-router'

import { handleCommerceGatewayRequest } from '@/features/commerce/server/commerce-gateway-response'

export const Route = createFileRoute('/api/commerce/$scope/$tenant/catalog')({
  server: {
    handlers: {
      GET: async ({ params, request }) =>
        await handleCommerceGatewayRequest({
          operation: { type: 'catalog' },
          request,
          scope: params.scope,
          tenant: params.tenant,
        }),
    },
  },
})
