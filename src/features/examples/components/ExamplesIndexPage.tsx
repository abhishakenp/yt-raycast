import { Link } from '@tanstack/react-router'
import { Blocks, ChevronRight } from 'lucide-react'

import { getExampleCategories } from '../lib/examples-data'
import { DEFAULT_EXAMPLES_THEME } from '../lib/examples-theme-search'

const formatTypes = (types: string[]): string =>
  types.slice(0, 5).join(', ') +
  (types.length > 5 ? ` +${types.length - 5}` : '')

export const ExamplesIndexPage = () => {
  const categories = getExampleCategories()

  return (
    <main className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 overflow-x-hidden bg-muted/40 text-foreground">
      <section className="border-b border-border bg-background">
        <div className="flex w-full flex-col gap-4 px-5 py-10 sm:px-8">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Blocks className="size-4" aria-hidden="true" />
            <span>Capsule Examples</span>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal md:text-5xl">
                Categories
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                Local OpenUI previews grouped by capsule category.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {categories.length} categories
            </div>
          </div>
        </div>
      </section>

      <section className="grid w-full grid-cols-1 gap-3 px-5 py-6 sm:px-8 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.category}
            to="/examples/$category"
            params={{ category: category.category }}
            search={{ theme: DEFAULT_EXAMPLES_THEME, mode: 'light' }}
            className="group flex min-h-36 flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-normal">
                  {category.label}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {formatTypes(category.functionalTypes)}
                </p>
              </div>
              <ChevronRight
                className="mt-1 size-5 text-muted-foreground transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
            <div className="mt-5 text-sm font-medium text-foreground/80">
              {category.capsuleCount} capsules
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
