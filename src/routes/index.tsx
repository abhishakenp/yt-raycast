import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

import { createDeploymentPreviewResponse } from '@/features/deployments/server/deployment-preview-response'
import { getDeploymentSlugFromRequest } from '@/features/deployments/server/public-metadata-response'

export const Route = createFileRoute('/')({
  component: lazyRouteComponent(
    () => import('@/features/home/components/HomePage'),
    'HomePage',
  ),
  server: {
    handlers: {
      GET: async ({ request, next }) => {
        const deploymentSlug = getDeploymentSlugFromRequest(request)
        return deploymentSlug === undefined
          ? await next()
          : await createDeploymentPreviewResponse(deploymentSlug, request)
      },
    },
  },
})
