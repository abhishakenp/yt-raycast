import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { FilterChip } from '#/section-kit/index.ts'
import { jobBoardLakebed } from './job-board-lakebed.ts'
import { useJobBoardSearch } from './job-board-interactions.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SearchForm,
  SearchField,
  SearchFieldIcon,
  SearchFieldInput,
  SearchSubmit,
} from '#/section-kit/SearchForm.tsx'

/**
 * JobBoardHero — newsprint classifieds front-page hero for a job-board /
 * careers marketplace. A paper band under a hairline masthead rule with a giant
 * ghost "JOBS" watermark: a mono jobs-available stamp, a huge serif display
 * headline, a supporting paragraph, and a real dual-field Lakebed search box
 * framed in a sharp-cornered hairline card with a hard offset shadow (a
 * role/keyword input with a search icon and a location input with a pin icon
 * plus a solid primary search button) above a row of rotated stamp popular-search
 * chips. The search form and every chip write shared search criteria so listings
 * below react immediately. Use as the top hero for job boards, hiring
 * marketplaces, talent networks or 'find a job' products where prominent search
 * is wanted. Renders fully with no props.
 */
export const JobBoardHero = defineCapsule({
  name: 'JobBoardHero',
  description:
    "Newsprint classifieds front-page hero for a job-board / careers marketplace: a paper band under a hairline masthead rule with a giant ghost JOBS watermark, a mono jobs-available stamp, a huge serif display headline, a supporting paragraph, and a real dual-field Lakebed search box framed in a sharp-cornered hairline card with a hard offset shadow (a role/keyword input with a search icon and a location input with a pin icon plus a solid primary search button) above a row of rotated stamp popular-search chips. The search form and chips write shared search criteria so JobBoardJobs reacts immediately. Use as the top hero for job boards, hiring marketplaces, talent networks or 'find a job' products where prominent search is wanted.",
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
      'w-full rounded-none border-0 bg-transparent py-3.5 pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground shadow-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring'

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden border-b border-border bg-background pb-16 pt-10 lg:pb-24 lg:pt-14',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-4 font-serif text-[7rem] sm:text-[11rem] lg:text-[15rem]">
          JOBS
        </Watermark>
        <Container size="xl" asChild>
          <HeroContent>
            {/* Masthead rule row. */}
            <div
              aria-hidden="true"
              className="mb-10 flex items-center justify-between gap-4 border-y border-border py-2 lg:mb-14"
            >
              <MonoTag tone="faint">The Careers Index</MonoTag>
              <MonoTag tone="faint" className="hidden sm:block">
                Verified employers · Daily
              </MonoTag>
            </div>

            <div className="mx-auto max-w-4xl">
              <span className="inline-block rotate-[-1.5deg] border border-foreground/60 bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                {badge}
              </span>
              <h1 className="mt-6 max-w-3xl text-balance font-serif text-[clamp(2.5rem,7vw,4.75rem)] font-bold leading-[0.98] tracking-tight text-foreground">
                {heading}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>

              <div className="mt-10 border-2 border-foreground bg-background shadow-[8px_8px_0_0] shadow-foreground/15">
                <SearchForm
                  key={`${queryValue}:${locationValue}`}
                  layout="row"
                  role="search"
                  aria-label="Job search"
                  onSubmit={jobSearch.submitSearch}
                  className="gap-0 p-0 sm:flex-row"
                >
                  <SearchField className="flex-1 border-b border-border sm:border-b-0 sm:border-r">
                    <SearchFieldIcon className="left-3 top-1/2 -translate-y-1/2">
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </SearchFieldIcon>
                    <SearchFieldInput
                      name="query"
                      type="text"
                      defaultValue={queryValue}
                      placeholder={searchPlaceholder}
                      aria-label="Search for jobs by title, keywords, or company"
                      className={inputCls}
                    />
                  </SearchField>
                  <SearchField className="flex-1">
                    <SearchFieldIcon className="left-3 top-1/2 -translate-y-1/2">
                      <svg
                        className="size-5"
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
                    </SearchFieldIcon>
                    <SearchFieldInput
                      name="location"
                      type="text"
                      defaultValue={locationValue}
                      placeholder={locationPlaceholder}
                      aria-label="Search location"
                      className={inputCls}
                    />
                  </SearchField>
                  <SearchSubmit
                    aria-busy={jobSearch.isPending}
                    disabled={jobSearch.isPending}
                    className="rounded-none px-8 py-3.5 transition-[background-color,transform] active:translate-y-px sm:whitespace-nowrap"
                  >
                    {jobSearch.isPending ? 'Searching' : searchCta}
                  </SearchSubmit>
                </SearchForm>
              </div>
              <p
                className="mt-3 font-mono text-xs text-muted-foreground"
                aria-live="polite"
              >
                {queryValue || locationValue
                  ? `Showing jobs for ${[queryValue, locationValue]
                      .filter(Boolean)
                      .join(' in ')}.`
                  : 'Search filters are shared with the listings below.'}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <MonoTag tone="faint" className="mr-1">
                  {popularLabel}
                </MonoTag>
                {popular.map((p, i) => (
                  <FilterChip
                    key={p}
                    variant="muted"
                    size="sm"
                    className={cn(
                      'rounded-none border border-foreground/60 bg-background font-mono text-[11px] uppercase tracking-[0.1em] text-foreground transition-[background-color,transform] hover:bg-muted active:translate-y-px',
                      i % 2 === 0 ? 'rotate-[-1.5deg]' : 'rotate-[1.5deg]',
                    )}
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
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
