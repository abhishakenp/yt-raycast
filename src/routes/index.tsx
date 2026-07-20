import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: lazyRouteComponent(
    () => import('@/features/home/components/HomePage'),
    'HomePage',
  ),
  server: {
    handlers: {
      GET: async ({ request, next }) => {
        const { createDeploymentPreviewResponse } =
          await import('@/features/deployments/server/deployment-preview-response')
        const { getDeploymentSlugFromRequest } =
          await import('@/features/deployments/server/public-metadata-response')
        const deploymentSlug = getDeploymentSlugFromRequest(request)
        return deploymentSlug === undefined
          ? await next()
          : await createDeploymentPreviewResponse(deploymentSlug, request)
      },
    },
  },
})
