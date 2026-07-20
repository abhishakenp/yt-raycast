import {
  createFileRoute,
  lazyRouteComponent,
  notFound,
} from '@tanstack/react-router'

import { isExamplesEnabled } from '@/features/examples/lib/examples-gate'
import { parseExamplesThemeSearch } from '@/features/examples/lib/examples-theme-search'

export const Route = createFileRoute('/examples/$category')({
  validateSearch: parseExamplesThemeSearch,
  beforeLoad: async ({ params }) => {
    if (!isExamplesEnabled()) throw notFound()
    const { hasExampleCategory } =
      await import('@/features/examples/lib/examples-categories')
    if (!hasExampleCategory(params.category)) throw notFound()
  },
  component: lazyRouteComponent(
    () => import('@/features/examples/components/ExamplesCategoryPage'),
    'ExamplesCategoryPage',
  ),
})
