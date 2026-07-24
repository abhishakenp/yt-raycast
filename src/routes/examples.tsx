import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'

import { isExamplesAccessible } from '@/features/examples/lib/examples-gate'

export const Route = createFileRoute('/examples')({
  beforeLoad: () => {
    if (!isExamplesAccessible()) throw notFound()
  },
  component: Outlet,
})
