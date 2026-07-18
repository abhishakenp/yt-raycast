import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { FilterChip } from '#/section-kit/index.ts'
import { Card } from '#/section-kit/Card.tsx'
import { propertyListingLakebed } from './property-listing-lakebed.ts'
import { usePropertyListingSearch } from './property-listing-interactions.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'

/**
 * PropertyListingHero — search-portal hero for a property marketplace. A split
 * layout pairs a left content column (eyebrow, bold headline, supporting line,
 * a prominent search bar with location + type/beds/price filter inputs and a
 * search button, plus a row of popular-search chips) with a right image collage
 * (one tall photo + two stacked photos). All imagery is alt-driven; search and
 * chips write shared Lakebed listing state so results update below. Use as the
 * opening hero for property search portals and listing marketplaces.
 */
export const PropertyListingHero = defineCapsule({
  name: 'PropertyListingHero',
  description:
    'Search-portal hero for a property marketplace: a split layout with a left content column (eyebrow, bold headline, supporting line, a prominent Lakebed search bar with location + type/beds/price filter inputs and a search button, plus popular-search chips) and a right image collage (one tall photo + two stacked photos). Imagery is alt-driven; search and chips write shared listing state so the results grid reacts immediately. Use as the opening hero for property search portals and listing marketplaces.',
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Bold headline. */
    heading: z.string().optional(),
    /** Supporting line beneath the headline. */
    subheading: z.string().optional(),
    /** Placeholder for the location search input. */
    locationPlaceholder: z.string().optional(),
    /** Filter chip labels (type / beds / price). */
    filters: z.array(z.string()).optional(),
    /** Search button label. */
    searchLabel: z.string().optional(),
    /** Route label the search button navigates to. */
    searchTarget: z.string().optional(),
    /** Popular-search chip labels. */
    popular: z.array(z.string()).optional(),
    /** Alt text driving the tall hero photo. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: propertyListingLakebed,
  component: ({ props, lakebed }) => {
    const propertySearch = usePropertyListingSearch(lakebed)
    const eyebrow = props.eyebrow ?? '10,000+ live listings'
    const heading = props.heading ?? 'Search every home in one place'
    const subheading =
      props.subheading ??
      'Browse verified listings for sale and rent, filter by what matters, and save the ones you love — all from one fast, clutter-free search.'
    const locationPlaceholder =
      props.locationPlaceholder ?? 'Enter a city, area, or ZIP'
    const filters = props.filters?.length
      ? props.filters
      : ['Any type', 'Beds', 'Price']
    const searchLabel = props.searchLabel ?? 'Search'
    const searchTarget = props.searchTarget ?? 'For Sale'
    const popular = props.popular?.length
      ? props.popular
      : ['Apartments', 'Houses', 'Pet-friendly', 'Under $2,000', 'New builds']
    const imageAlt =
      props.imageAlt ??
      'bright modern apartment interior with floor-to-ceiling windows and city skyline view'
    const locationValue = propertySearch.state?.location ?? ''
    const activeFilter = propertySearch.state?.filter || searchTarget

    return (
      <HeroSection
        variant="split"
        className={cn('bg-background py-16 lg:py-24', props.className)}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-[0.15em] text-primary uppercase">
              {eyebrow}
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              {heading}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {subheading}
            </p>

            <Card
              asChild
              variant="default"
              rounded="2xl"
              padding="none"
              shadow="sm"
              className="mt-8 p-3"
            >
              <form
                key={`${locationValue}:${activeFilter}`}
                onSubmit={propertySearch.submitSearch}
              >
                <label className="sr-only" htmlFor="property-location-search">
                  Search by city, area, or ZIP
                </label>
                <input
                  id="property-location-search"
                  name="location"
                  defaultValue={locationValue}
                  placeholder={locationPlaceholder}
                  className="w-full rounded-xl border-0 bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input type="hidden" name="filter" value={activeFilter} />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-1 flex-wrap gap-2">
                    {filters.map((filter) => {
                      const isActive = activeFilter === filter
                      return (
                        <FilterChip
                          key={filter}
                          active={isActive}
                          variant={isActive ? 'default' : 'outline'}
                          className="rounded-lg"
                          onClick={() =>
                            propertySearch.chooseSearch({
                              filter,
                              location: locationValue,
                              query: '',
                            })
                          }
                        >
                          {filter}
                        </FilterChip>
                      )
                    })}
                  </div>
                  <button
                    type="submit"
                    aria-busy={propertySearch.isPending}
                    disabled={propertySearch.isPending}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {propertySearch.isPending ? 'Searching' : searchLabel}
                  </button>
                </div>
              </form>
            </Card>

            <p
              className="mt-3 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {locationValue || activeFilter
                ? `Showing ${[activeFilter, locationValue].filter(Boolean).join(' in ')} listings below.`
                : 'Search filters are shared with the listings below.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {popular.map((item) => (
                <FilterChip
                  key={item}
                  active={propertySearch.state?.query === item}
                  variant="muted"
                  size="sm"
                  onClick={() =>
                    propertySearch.chooseSearch({
                      filter: searchTarget,
                      location: '',
                      query: item,
                    })
                  }
                >
                  {item}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative row-span-2 aspect-[3/4] overflow-hidden rounded-2xl bg-card">
              <Image
                alt={imageAlt}
                w={600}
                h={800}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-card">
              <Image
                alt="cozy suburban townhouse exterior with a small front garden on a sunny day"
                w={600}
                h={600}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-card">
              <Image
                alt="open-plan kitchen and living room with warm wood floors and natural light"
                w={600}
                h={600}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
          </div>
        </div>
      </HeroSection>
    )
  },
})
