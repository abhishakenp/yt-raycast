import { createFileRoute } from '@tanstack/react-router'

import { createDeploymentMedusaConfigResponse } from '@/features/commerce/server/commerce-tenant-api-response'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

export const Route = createFileRoute(
  '/api/deployments/$deploymentSlug/medusa-config',
)({
  server: {
    handlers: {
      GET: async ({ params }: { params: { deploymentSlug: string } }) =>
        await createDeploymentMedusaConfigResponse(
          params.deploymentSlug,
          createRuntimeConvexHttpClient(),
        ),
    },
  },
})
