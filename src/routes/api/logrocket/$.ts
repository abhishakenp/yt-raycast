import { createFileRoute } from '@tanstack/react-router'

import { proxyLogRocketRequest } from '@/features/logrocket/server/logrocket-proxy'

/**
 * Catch-all route that proxies all LogRocket traffic through our own domain.
 * Matches `/api/logrocket/cdn/*` and `/api/logrocket/ingest/*`.
 *
 * This is the ad-blocker bypass: the browser only sees same-origin requests
 * to `/api/logrocket/*`, never to `cdn.logrocket.com` or `r.lr-ingest.com`.
 */
export const Route = createFileRoute('/api/logrocket/$')({
  server: {
    handlers: {
      GET: async ({ request }) => proxyLogRocketRequest(request),
      POST: async ({ request }) => proxyLogRocketRequest(request),
    },
  },
})
