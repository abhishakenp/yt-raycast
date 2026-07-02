import { createFileRoute } from '@tanstack/react-router'

import {
  createConfiguredMedusaTenantProvisioner,
  createDeploymentMedusaProvisionResponse,
} from '@/features/commerce/server/commerce-tenant-api-response'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

export const Route = createFileRoute(
  '/api/deployments/$deploymentSlug/provision/medusa',
)({
  server: {
    handlers: {
      POST: async ({
        params,
        request,
      }: {
        params: { deploymentSlug: string }
        request: Request
      }) =>
        await createDeploymentMedusaProvisionResponse(
          params.deploymentSlug,
          request,
          createRuntimeConvexHttpClient(),
          createConfiguredMedusaTenantProvisioner(process.env),
        ),
    },
  },
})
