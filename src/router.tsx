import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { subdomainRewrite } from '@/features/deployments/server/subdomain-rewrite'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    rewrite: subdomainRewrite,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
