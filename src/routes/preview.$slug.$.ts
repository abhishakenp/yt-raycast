import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/preview/$slug/$')({
  component: lazyRouteComponent(
    () => import('./-session-preview-route'),
    'PreviewRoute',
  ),
})
