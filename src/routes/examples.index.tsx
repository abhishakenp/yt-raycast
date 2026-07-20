import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/examples/')({
  component: lazyRouteComponent(
    () => import('@/features/examples/components/ExamplesIndexPage'),
    'ExamplesIndexPage',
  ),
})
