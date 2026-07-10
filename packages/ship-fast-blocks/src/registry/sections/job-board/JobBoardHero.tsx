import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card, FilterChip } from '#/section-kit/index.ts'
import { jobBoardLakebed } from './job-board-lakebed.ts'
import { useJobBoardSearch } from './job-board-interactions.tsx'

/**
 * JobBoardHero — centered, conversion-focused hero for a job-board / careers
 * marketplace. A soft border-bottomed band with a centered column: a small
 * jobs-available pill, a large headline, a supporting paragraph, and a real
 * dual-field search box (a card holding a role/keyword input with a search icon
 * and a location input with a pin icon, plus a solid primary search button) above
 * a row of popular-search chips. The search form and every chip writes shared
 * Lakebed search criteria so listings below react immediately. Use as the top
 * hero for job boards, hiring marketplaces, talent networks or 'find a job'
 * products where prominent search is wanted. Renders fully with no props.
 */
export const JobBoardHero = defineCapsule({
  name: 'JobBoardHero',
  description:
    "Centered, conversion-focused hero for a job-board / careers marketplace: a soft border-bottomed band with a jobs-available pill, large headline, supporting paragraph, and a real dual-field Lakebed search box (a card holding a role/keyword input with a search icon and a location input with a pin icon plus a solid primary search button) above a row of popular-search chips. The search form and chips write shared search criteria so JobBoardJobs reacts immediately. Use as the top hero for job boards, hiring marketplaces, talent networks or 'find a job' products where prominent search is wanted.",
  props: z.object({
    /** Small pill above the headline. */
    badge: z.string().optional(),
    /** Main hero headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Placeholder for the role / keyword input. */
    searchPlaceholder: z.string().optional(),
    /** Placeholder for the location input. */
    locationPlaceholder: z.string().optional(),
    /** Search submit button label. */
    searchCta: z.string().optional(),
    /** Label preceding the popular-search chips. */
    popularLabel: z.string().optional(),
    /** Popular-search chip labels. */
    popular: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: jobBoardLakebed,
  component: ({ props, lakebed }) => {
    const jobSearch = useJobBoardSearch(lakebed)
    const badge = props.badge ?? 'Over 12,000 jobs available this week'
    const heading = props.heading ?? 'Find work that moves your career forward'
    const subheading =
      props.subheading ??
      'Connect with top employers hiring remote, hybrid, and on-site roles. From startups to Fortune 500s, discover opportunities that match your skills and aspirations.'
    const searchPlaceholder =
      props.searchPlaceholder ?? 'Job title, keywords, or company'
    const locationPlaceholder =
      props.locationPlaceholder ?? 'City, state, or remote'
    const searchCta = props.searchCta ?? 'Search Jobs'
    const popularLabel = props.popularLabel ?? 'Popular:'
    const popular = props.popular?.length
      ? props.popular
      : ['Remote', 'Engineering', 'Design', 'Marketing', 'Product']
    const queryValue = jobSearch.state?.query ?? ''
    const locationValue = jobSearch.state?.location ?? ''

    const inputCls =
      'w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'

    return (
      <section
        className={cn(
          'relative border-b border-border bg-background',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {badge}
            </span>
            <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {heading}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {subheading}
            </p>

            <Card
              rounded="2xl"
              padding="none"
              shadow="lg"
              className="mx-auto max-w-4xl p-2 sm:p-4"
            >
              <form
                key={`${queryValue}:${locationValue}`}
                className="flex flex-col gap-3 sm:flex-row"
                role="search"
                aria-label="Job search"
                onSubmit={jobSearch.submitSearch}
              >
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    name="query"
                    type="text"
                    defaultValue={queryValue}
                    placeholder={searchPlaceholder}
                    aria-label="Search for jobs by title, keywords, or company"
                    className={inputCls}
                  />
                </div>
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    name="location"
                    type="text"
                    defaultValue={locationValue}
                    placeholder={locationPlaceholder}
                    aria-label="Search location"
                    className={inputCls}
                  />
                </div>
                <button
                  type="submit"
                  aria-busy={jobSearch.isPending}
                  disabled={jobSearch.isPending}
                  className="rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:whitespace-nowrap"
                >
                  {jobSearch.isPending ? 'Searching' : searchCta}
                </button>
              </form>
              <p
                className="mt-3 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {queryValue || locationValue
                  ? `Showing jobs for ${[queryValue, locationValue]
                      .filter(Boolean)
                      .join(' in ')}.`
                  : 'Search filters are shared with the listings below.'}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>{popularLabel}</span>
                {popular.map((p) => (
                  <FilterChip
                    key={p}
                    variant="muted"
                    size="sm"
                    onClick={() =>
                      jobSearch.chooseSearch({
                        filter: p === 'Remote' ? 'Remote' : 'All Jobs',
                        location: p === 'Remote' ? 'Remote' : '',
                        query: p === 'Remote' ? '' : p,
                      })
                    }
                  >
                    {p}
                  </FilterChip>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    )
  },
})
