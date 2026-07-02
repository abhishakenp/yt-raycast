import { createFileRoute } from '@tanstack/react-router'

import { createDeploymentMedusaWebhookResponse } from '@/features/commerce/server/commerce-tenant-api-response'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

export const Route = createFileRoute(
  '/api/deployments/$deploymentSlug/medusa-webhook',
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
        await createDeploymentMedusaWebhookResponse(
          params.deploymentSlug,
          request,
          createRuntimeConvexHttpClient(),
          { env: process.env, fetch },
        ),
    },
  },
})
