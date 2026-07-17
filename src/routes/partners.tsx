import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/partners')({
  component: lazyRouteComponent(
    () => import('./partners/-PartnersPage'),
    'PartnersPage',
  ),
})
