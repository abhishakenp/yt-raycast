import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/generate/$sessionId')({
  component: lazyRouteComponent(
    () => import('./-generate-dashboard-route'),
    'GenerateRoute',
  ),
})
