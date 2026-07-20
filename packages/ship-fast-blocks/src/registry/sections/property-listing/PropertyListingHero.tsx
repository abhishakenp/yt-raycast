import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { FilterChip } from '#/section-kit/FilterChip.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  FormField,
  FormFieldLabel,
  FormFieldControl,
} from '#/section-kit/FormField.tsx'
import { propertyListingLakebed } from './property-listing-lakebed.ts'
import { usePropertyListingSearch } from './property-listing-interactions.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * PropertyListingHero — editorial search-portal hero for a property
 * marketplace. An asymmetric 7:5 split over a giant ghost "HOMES" watermark: on
 * the left a mono index eyebrow rule (primary tick + hairline), an oversized
 * extrabold tight-tracked headline, a supporting line, a sharp hairline-framed
 * search bar (location input + rounded-none type/beds/price filter chips + a
 * square ink search button), and a row of popular-search chips; on the right a
 * staggered trio of hairline-framed property plates on offset frames. All
 * imagery is alt-driven; search and chips write shared Lakebed listing state so
 * results update below. Use as the opening hero for property search portals and
 * listing marketplaces.
 */
export const PropertyListingHero = defineCapsule({
  name: 'PropertyListingHero',
  description:
    'Editorial search-portal hero for a property marketplace: an asymmetric 7:5 split over a giant ghost watermark, with a mono index eyebrow rule, an oversized extrabold tight-tracked headline, a supporting line, a sharp hairline-framed Lakebed search bar (location input + rounded-none type/beds/price filter chips + a square ink search button), and popular-search chips on the left, and a staggered trio of hairline-framed property plates on offset frames on the right. Imagery is alt-driven; search and chips write shared listing state so the results grid reacts immediately. Use as the opening hero for property search portals and listing marketplaces.',
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
        className={cn(
          'relative overflow-hidden bg-background py-14 lg:py-20',
          props.className,
        )}
      >
        <Watermark className="right-[-0.06em] top-1 text-[clamp(6rem,17vw,14rem)] uppercase">
          Homes
        </Watermark>
        <Container className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                {eyebrow}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <span
                aria-hidden="true"
                className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60 sm:inline"
              >
                01 / Listings
              </span>
            </div>
            <h1 className="mt-7 max-w-2xl text-[clamp(2.5rem,5.5vw,4.75rem)] font-extrabold leading-[0.95] tracking-tighter text-foreground">
              {heading}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {subheading}
            </p>

            <Card
              asChild
              variant="default"
              className="mt-8 rounded-none border-foreground/15 p-3 shadow-[6px_6px_0_0] shadow-foreground/10"
            >
              <form
                key={`${locationValue}:${activeFilter}`}
                onSubmit={propertySearch.submitSearch}
              >
                <FormField>
                  <FormFieldLabel
                    className="sr-only"
                    htmlFor="property-location-search"
                  >
                    Search by city, area, or ZIP
                  </FormFieldLabel>
                  <FormFieldControl
                    id="property-location-search"
                    name="location"
                    defaultValue={locationValue}
                    placeholder={locationPlaceholder}
                    className="w-full rounded-none border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                  />
                </FormField>
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
                          className="rounded-none font-mono text-[11px] uppercase tracking-[0.12em]"
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
                    className="inline-flex items-center justify-center rounded-none bg-foreground px-7 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                  >
                    {propertySearch.isPending ? 'Searching' : searchLabel}
                  </button>
                </div>
              </form>
            </Card>

            <p
              className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
              aria-live="polite"
            >
              {locationValue || activeFilter
                ? `Showing ${[activeFilter, locationValue].filter(Boolean).join(' in ')} listings below.`
                : 'Search filters are shared with the listings below.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/60">
                Popular
              </span>
              {popular.map((item) => (
                <FilterChip
                  key={item}
                  active={propertySearch.state?.query === item}
                  variant="muted"
                  size="sm"
                  className="rounded-none"
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

          <div className="grid grid-cols-2 gap-4 lg:col-span-5">
            <div className="relative row-span-2 mr-1.5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 border border-foreground/20"
              />
              <div className="relative aspect-[3/4] overflow-hidden border border-foreground/15 bg-muted">
                <Image
                  alt={imageAlt}
                  w={600}
                  h={800}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden border border-foreground/15 bg-muted sm:translate-y-4 lg:translate-y-6">
              <Image
                alt="cozy suburban townhouse exterior with a small front garden on a sunny day"
                w={600}
                h={600}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <div className="relative aspect-square overflow-hidden border border-foreground/15 bg-muted">
              <Image
                alt="open-plan kitchen and living room with warm wood floors and natural light"
                w={600}
                h={600}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
