import { createFileRoute } from '@tanstack/react-router'

import { createDeploymentPreviewResponse } from '@/features/deployments/server/deployment-preview-response'

export const Route = createFileRoute('/preview/$slug')({
  server: {
    handlers: {
      GET: async ({ params, request }) =>
        await createDeploymentPreviewResponse(params.slug, request),
    },
  },
})
