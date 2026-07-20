import {
  createFileRoute,
  lazyRouteComponent,
  notFound,
} from '@tanstack/react-router'

import { hasExampleCategory } from '@/features/examples/lib/examples-categories'
import { isExamplesEnabled } from '@/features/examples/lib/examples-gate'
import { parseExamplesThemeSearch } from '@/features/examples/lib/examples-theme-search'

export const Route = createFileRoute('/examples/$category')({
  validateSearch: parseExamplesThemeSearch,
  beforeLoad: ({ params }) => {
    if (!isExamplesEnabled()) throw notFound()
    if (!hasExampleCategory(params.category)) throw notFound()
  },
  component: lazyRouteComponent(
    () => import('@/features/examples/components/ExamplesCategoryPage'),
    'ExamplesCategoryPage',
  ),
})
