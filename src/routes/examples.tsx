import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'

import { isExamplesEnabled } from '@/features/examples/lib/examples-gate'

export const Route = createFileRoute('/examples')({
  beforeLoad: () => {
    if (!isExamplesEnabled()) throw notFound()
  },
  component: Outlet,
})
