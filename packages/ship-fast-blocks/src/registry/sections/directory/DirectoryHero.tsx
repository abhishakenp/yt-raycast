import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
import { directoryLakebed } from './directory-lakebed.ts'
import { useDirectorySearch } from './directory-interactions.tsx'

/**
 * DirectoryHero — newsprint front-page hero for a local-business directory /
 * listings landing page. A paper band under a hairline masthead row with a
 * giant ghost "INDEX" watermark and an asymmetric 7/5 split: left, a huge
 * serif display headline, supporting paragraph, and a sharp-cornered
 * hairline-framed search bar with hard offset shadow (leading magnifier icon
 * + embedded primary submit); right, a slightly rotated classified "popular
 * queries" ledger card whose index-numbered rows are clickable. Search submit
 * and every ledger row write shared Lakebed directory search state. Use as
 * the opening hero for local directories, find-a-service platforms,
 * review-and-discovery sites, or city guides where a search-first entry point
 * is wanted.
 */
export const DirectoryHero = defineCapsule({
  name: 'DirectoryHero',
  description:
    'Newsprint front-page hero for a local-business DIRECTORY / listings landing page: a paper band under a hairline masthead row with a giant ghost INDEX watermark and an asymmetric 7/5 split — left, a huge serif display headline, supporting paragraph, and a sharp-cornered hairline-framed Lakebed SEARCH bar with hard offset shadow (leading magnifier icon plus an embedded primary submit button); right, a slightly rotated classified Popular-queries ledger card whose index-numbered rows are clickable. Search submit and every ledger row write shared directory search state so featured listings react immediately. Use as the opening hero for local directories, business-listing marketplaces, find-a-service / find-a-pro platforms, review-and-discovery sites, or city guides.',
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
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden bg-background pb-16 pt-10 lg:pb-24 lg:pt-14',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-6 font-serif text-[7rem] sm:text-[11rem] lg:text-[16rem]">
          INDEX
        </Watermark>
        <Container asChild>
          <HeroContent>
            {/* Masthead rule row. */}
            <div
              aria-hidden="true"
              className="mb-10 flex items-center justify-between gap-4 border-y border-border py-2 lg:mb-14"
            >
              <MonoTag tone="faint">The Local Index</MonoTag>
              <MonoTag tone="faint" className="hidden sm:block">
                Verified listings · Daily
              </MonoTag>
            </div>

            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-7">
                <h1 className="text-balance font-serif text-[clamp(2.5rem,7vw,4.75rem)] font-bold leading-[0.98] tracking-tight text-foreground">
                  {heading}
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  {subheading}
                </p>

                <div className="mt-10 max-w-xl">
                  <SearchForm
                    key={`${queryValue}:${categoryValue}`}
                    onSubmit={directorySearch.submitSearch}
                  >
                    <SearchField className="border-2 border-foreground bg-background shadow-[6px_6px_0_0] shadow-foreground/15">
                      <SearchFieldIcon>
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
                          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </SearchFieldIcon>
                      <SearchFieldInput
                        name="query"
                        type="search"
                        defaultValue={queryValue || categoryValue}
                        placeholder={searchPlaceholder}
                        aria-label="Search businesses"
                        className="rounded-none border-0 bg-transparent py-4 pr-28 shadow-none sm:pr-32 focus:ring-2 focus:ring-ring"
                      />
                      <SearchSubmit
                        aria-busy={directorySearch.isPending}
                        disabled={directorySearch.isPending}
                        className="absolute bottom-1.5 right-1.5 top-1.5 rounded-none px-4 text-sm transition-[background-color,transform] active:translate-y-px sm:px-6"
                      >
                        {directorySearch.isPending ? 'Searching' : searchCta}
                      </SearchSubmit>
                    </SearchField>
                  </SearchForm>
                  <p
                    className="mt-3 font-mono text-xs text-muted-foreground"
                    aria-live="polite"
                  >
                    {queryValue || categoryValue
                      ? `Showing directory results for ${queryValue || categoryValue}.`
                      : 'Search is shared with featured listings below.'}
                  </p>
                </div>
              </div>

              {/* Classified "popular queries" ledger card. */}
              <div className="lg:col-span-5 lg:pl-6">
                <div className="max-w-md border border-foreground/60 bg-background lg:rotate-[0.6deg]">
                  <div className="flex items-center justify-between border-b border-foreground/60 px-4 py-2.5">
                    <MonoTag>{popularLabel}</MonoTag>
                    <MonoTag tone="faint" aria-hidden="true">
                      Filed today
                    </MonoTag>
                  </div>
                  <ul className="divide-y divide-border">
                    {popular.map((term, i) => (
                      <li key={term}>
                        <button
                          type="button"
                          onClick={() =>
                            directorySearch.chooseSearch({
                              category: term,
                              query: '',
                            })
                          }
                          className="group flex w-full items-baseline gap-3 px-4 py-3 text-left transition-colors hover:bg-muted active:translate-y-px"
                        >
                          <span
                            aria-hidden="true"
                            className="font-mono text-[11px] tabular-nums text-muted-foreground"
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="flex-1 text-sm font-medium text-foreground">
                            {term}
                          </span>
                          <span
                            aria-hidden="true"
                            className="font-mono text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
