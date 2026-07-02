import { createFileRoute } from '@tanstack/react-router'

import { createDeploymentMedusaPullResponse } from '@/features/commerce/server/commerce-tenant-api-response'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

export const Route = createFileRoute(
  '/api/deployments/$deploymentSlug/medusa-pull',
)({
  server: {
    handlers: {
      POST: async ({
        params,
        request,
      }: {
        params: { deploymentSlug: string }
        request: Request
      }) => {
        const body = (await request.json().catch(() => ({}))) as {
          anonymousOwnerSecret?: unknown
        }
        const anonymousOwnerSecret =
          typeof body.anonymousOwnerSecret === 'string' &&
          body.anonymousOwnerSecret.trim()
            ? body.anonymousOwnerSecret.trim()
            : (request.headers.get('x-ship-fast-owner-secret') ?? undefined)

        return await createDeploymentMedusaPullResponse(
          params.deploymentSlug,
          { anonymousOwnerSecret, fetch, source: 'manual' },
          createRuntimeConvexHttpClient(),
        )
      },
    },
  },
})
