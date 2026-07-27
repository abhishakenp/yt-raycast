import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/generate/$sessionId/$')({
  preloadStaleTime: 30_000,
  component: lazyRouteComponent(
    () => import('./-generate-dashboard-route'),
    'GenerateRoute',
  ),
})
