import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

import { api } from '../../convex/_generated/api'
import { getDeploymentSlugFromRequest } from '@/features/deployments/server/public-metadata-response'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

export const Route = createFileRoute('/')({
  component: lazyRouteComponent(
    () => import('@/features/home/components/HomePage'),
    'HomePage',
  ),
  server: {
    handlers: {
      GET: async ({ request, next }) => {
        const deploymentSlug = getDeploymentSlugFromRequest(request)
        if (deploymentSlug === undefined) return await next()

        // Resolve the deployment slug to a session ID, then redirect to the
        // live preview route so the subdomain serves the same fullstack React
        // app as /preview/<sessionId> (commerce, forms, search, etc.) instead
        // of a static HTML snapshot.
        const client = createRuntimeConvexHttpClient()
        let sessionId: string | undefined
        try {
          const deployment = await client.query(
            api.sessions.getDeploymentBySlug,
            { slug: deploymentSlug },
          )
          if (
            deployment !== null &&
            deployment.status === 'ready' &&
            typeof deployment.sessionId === 'string'
          ) {
            sessionId = deployment.sessionId
          }
        } catch {
          // Convex unavailable — fall through to 404
        }

        if (sessionId === undefined) {
          return new Response('Deployment not found', {
            status: 404,
            headers: { 'content-type': 'text/plain' },
          })
        }

        return new Response(null, {
          status: 302,
          headers: {
            location: `/preview/${sessionId}`,
            'cache-control': 'no-store',
          },
        })
      },
    },
  },
})
