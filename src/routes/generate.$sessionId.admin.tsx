import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

import { IntroLoader } from '@/components/GenUI/IntroLoader'
import { loadGenerationRouteView } from '@/features/dashboard/services/generation-route-loader'

export const Route = createFileRoute('/generate/$sessionId/admin')({
  loader: ({ abortController, params }) =>
    loadGenerationRouteView({
      sessionId: params.sessionId,
      signal: abortController.signal,
    }),
  pendingComponent: () => <IntroLoader playSound={false} />,
  pendingMs: 0,
  pendingMinMs: 0,
  preloadStaleTime: 30_000,
  component: lazyRouteComponent(
    () => import('./-generate-dashboard-route'),
    'GenerateAdminRoute',
  ),
})
