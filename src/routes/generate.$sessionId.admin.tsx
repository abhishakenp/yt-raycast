import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/generate/$sessionId/admin')({
  component: lazyRouteComponent(
    () => import('./-generate-dashboard-route'),
    'GenerateAdminRoute',
  ),
})
