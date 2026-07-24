import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/deployed/$slug/$')({
  component: lazyRouteComponent(
    () => import('./-subdomain-preview-route'),
    'SubdomainPreviewRoute',
  ),
})
