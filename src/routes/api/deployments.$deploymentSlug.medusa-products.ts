import { createFileRoute } from '@tanstack/react-router'

import { createDeploymentMedusaProductsResponse } from '@/features/commerce/server/commerce-tenant-api-response'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

export const Route = createFileRoute(
  '/api/deployments/$deploymentSlug/medusa-products',
)({
  server: {
    handlers: {
      GET: async ({ params }: { params: { deploymentSlug: string } }) =>
        await createDeploymentMedusaProductsResponse(
          params.deploymentSlug,
          { fetch },
          createRuntimeConvexHttpClient(),
        ),
    },
  },
})
