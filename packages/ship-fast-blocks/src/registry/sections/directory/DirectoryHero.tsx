import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { directoryLakebed } from './directory-lakebed.ts'
import { useDirectorySearch } from './directory-interactions.tsx'

/**
 * DirectoryHero — centered, search-led hero for a local-business directory /
 * listings landing page. A card-surface band with a large centered headline,
 * a supporting paragraph, a prominent rounded search bar (leading magnifier
 * icon + embedded primary submit button), and a "Popular:" row of clickable
 * dot-separated query chips beneath. Search submit and every chip write shared
 * Lakebed directory search state. Use as the opening hero for local directories, find-a-service
 * platforms, review-and-discovery sites, or city guides where a trustworthy,
 * search-first entry point is wanted.
 */
export const DirectoryHero = defineCapsule({
  name: 'DirectoryHero',
  description:
    'Centered, search-led hero for a local-business DIRECTORY / listings landing page: a card-surface band with a large centered headline, a supporting paragraph, a prominent rounded Lakebed SEARCH bar (leading magnifier icon plus an embedded primary submit button), and a Popular: row of clickable dot-separated query chips beneath. Search submit and every chip write shared directory search state so featured listings react immediately. Use as the opening hero for local directories, business-listing marketplaces, find-a-service / find-a-pro platforms, review-and-discovery sites, or city guides where a trustworthy, search-first entry point is wanted.',
  props: z.object({
    /** Hero heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    subheading: z.string().optional(),
    /** Placeholder text for the search input. */
    searchPlaceholder: z.string().optional(),
    /** Search submit button label. */
    searchCta: z.string().optional(),
    /** Label preceding the popular-query chips. */
    popularLabel: z.string().optional(),
    /** Popular-query chip labels. */
    popular: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: directoryLakebed,
  component: ({ props, lakebed }) => {
    const directorySearch = useDirectorySearch(lakebed)
    const heading = props.heading ?? 'Discover Local Businesses Near You'
    const subheading =
      props.subheading ??
      'From cozy cafes to trusted plumbers, find the best local services with real reviews and verified ratings from your community.'
    const searchPlaceholder =
      props.searchPlaceholder ?? 'Search businesses, services, or categories...'
    const searchCta = props.searchCta ?? 'Search'
    const popularLabel = props.popularLabel ?? 'Popular:'
    const popular = props.popular?.length
      ? props.popular
      : ['Coffee Shops', 'Hair Salons', 'Electricians', 'Yoga Studios']
    const queryValue = directorySearch.state?.query ?? ''
    const categoryValue = directorySearch.state?.category ?? ''

    return (
      <header
        className={cn('bg-card pb-20 pt-16 lg:pb-28 lg:pt-24', props.className)}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {subheading}
          </p>

          <div className="mx-auto max-w-2xl">
            <form
              key={`${queryValue}:${categoryValue}`}
              onSubmit={directorySearch.submitSearch}
              className="relative"
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                  className="size-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                name="query"
                type="search"
                defaultValue={queryValue || categoryValue}
                placeholder={searchPlaceholder}
                aria-label="Search businesses"
                className="w-full rounded-xl border border-input bg-muted py-4 pl-12 pr-32 text-foreground placeholder-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                aria-busy={directorySearch.isPending}
                disabled={directorySearch.isPending}
                className="absolute bottom-2 right-2 top-2 rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
              >
                {directorySearch.isPending ? 'Searching' : searchCta}
              </button>
            </form>
            <p
              className="mt-3 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {queryValue || categoryValue
                ? `Showing directory results for ${queryValue || categoryValue}.`
                : 'Search is shared with featured listings below.'}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
              <span>{popularLabel}</span>
              {popular.map((term, i) => (
                <span key={term} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      directorySearch.chooseSearch({
                        category: term,
                        query: '',
                      })
                    }
                    className="underline-offset-2 transition-colors hover:text-foreground hover:underline"
                  >
                    {term}
                  </button>
                  {i < popular.length - 1 ? <span>·</span> : null}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>
    )
  },
})
