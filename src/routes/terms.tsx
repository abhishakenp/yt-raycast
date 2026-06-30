import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  component: lazyRouteComponent(
    () => import('./terms/-TermsPage'),
    'TermsPage',
  ),
})
