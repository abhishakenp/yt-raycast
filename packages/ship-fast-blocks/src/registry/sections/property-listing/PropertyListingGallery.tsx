import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { FilterChip } from '#/section-kit/FilterChip.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  ListingCard,
  ListingCardBadge,
  ListingCardMedia,
  ListingCardSpecRow,
} from '#/section-kit/ListingCard.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import type { PropertyListingCatalogInput } from './property-listing-lakebed.ts'
import {
  propertyListingLakebed,
  type PropertyListingRecord,
} from './property-listing-lakebed.ts'
import {
  PropertyListingInquiryButton,
  PropertyListingMutationSpinner,
  PropertyListingSaveButton,
  usePropertyListingActions,
  usePropertyListingSearch,
  useSyncPropertyListings,
} from './property-listing-interactions.tsx'

/**
 * PropertyListingGallery — editorial search-results grid for a property
 * marketplace. An asymmetric header pairs a left-aligned extrabold heading with
 * a rounded-none mono filter-chip strip and a mono "[ results ]" count, above a
 * staggered responsive 1/2/3-column grid of sharp hairline-framed listing
 * plates. Each plate carries an alt-driven photo with an optional corner tag and
 * a save-heart button, a giant tabular price, a mono beds / baths / sqft spec
 * ledger, the address, and a hairline-ruled square "Contact agent" button.
 * Alternating plates step down on a vertical rhythm. Filter chips update shared
 * Lakebed search state; save-heart and cards update saved/selected listing
 * state. Use to render listing results in a search portal.
 */
export const PropertyListingGallery = defineCapsule({
  name: 'PropertyListingGallery',
  description:
    'Editorial search-results grid for a property marketplace: an asymmetric header pairing a left-aligned extrabold heading with a rounded-none mono filter-chip strip and a mono result count, above a staggered responsive 1/2/3-column grid of sharp hairline-framed listing plates. Each plate carries an alt-driven photo with an optional corner tag and a save-heart button, a giant tabular price, a mono beds / baths / sqft spec ledger, the address, and a hairline-ruled square "Contact agent" button. Filter chips update shared Lakebed listing search state; save-heart and cards update saved/selected listing state. Use to render listing results in a search portal.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Horizontal filter-chip labels. */
    filters: z.array(z.string()).optional(),
    /** Listing cards. */
    listings: z
      .array(
        z.object({
          price: z.string(),
          beds: z.string(),
          baths: z.string(),
          sqft: z.string(),
          address: z.string(),
          tag: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: propertyListingLakebed,
  component: ({ props, lakebed }) => {
    const propertySearch = usePropertyListingSearch(lakebed)
    const propertyActions = usePropertyListingActions(lakebed)
    const heading = props.heading ?? 'Homes for you'
    const filters = props.filters?.length
      ? props.filters
      : ['For Sale', 'For Rent', 'Any type', 'Beds', 'Price', 'More']
    const listings: PropertyListingCatalogInput[] = props.listings?.length
      ? props.listings
      : [
          {
            price: '$2,400/mo',
            beds: '2',
            baths: '1',
            sqft: '980',
            address: '210 Birch St #5, Midtown',
            tag: 'For Rent',
          },
          {
            price: '$615,000',
            beds: '3',
            baths: '2',
            sqft: '1,640',
            address: '88 Aspen Way, Northgate',
            tag: 'New',
          },
          {
            price: '$1,890/mo',
            beds: '1',
            baths: '1',
            sqft: '720',
            address: '44 Harbor Loop #12, Dockside',
            tag: 'For Rent',
          },
          {
            price: '$945,000',
            beds: '4',
            baths: '3',
            sqft: '2,310',
            address: '1207 Cedar Hollow, Lakeview',
          },
          {
            price: '$3,100/mo',
            beds: '3',
            baths: '2',
            sqft: '1,420',
            address: '9 Garden Mews, Old Town',
            tag: 'Verified',
          },
          {
            price: '$420,000',
            beds: '2',
            baths: '1',
            sqft: '1,050',
            address: '330 Willow Bend #2C, Eastside',
          },
        ]
    useSyncPropertyListings(lakebed, listings)
    const catalog = (lakebed.useQuery('propertyCatalog') ??
      []) as PropertyListingRecord[]
    const listingCatalog = catalog.length ? catalog : listings
    const activeFilter = propertySearch.state?.filter ?? filters[0] ?? ''
    const activeLocation = propertySearch.state?.location.toLowerCase() ?? ''
    const activeQuery = propertySearch.state?.query.toLowerCase() ?? ''
    const savedAddresses = new Set(propertyActions.state?.savedAddresses ?? [])
    const selectedAddress = propertyActions.state?.selectedAddress ?? ''
    const matchesFilter = (listing: PropertyListingCatalogInput) => {
      const listingStatus = listing.price.includes('/mo')
        ? 'For Rent'
        : 'For Sale'
      const haystack = [
        listing.address,
        listing.price,
        listing.beds,
        listing.baths,
        listing.sqft,
        listing.tag ?? '',
        listingStatus,
      ]
        .join(' ')
        .toLowerCase()
      const filterValue = activeFilter.toLowerCase()
      const locationMatches =
        !activeLocation || haystack.includes(activeLocation)
      const queryMatches = !activeQuery || haystack.includes(activeQuery)
      const filterMatches =
        !filterValue ||
        filterValue === 'any type' ||
        filterValue === 'more' ||
        haystack.includes(filterValue)

      return locationMatches && queryMatches && filterMatches
    }
    const matchingListings = listingCatalog.filter(matchesFilter)

    return (
      <section className={cn('bg-muted py-16 lg:py-24', props.className)}>
        <Container size="xl" className="px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-5">
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
              />
              <div className="flex flex-wrap gap-2">
                {filters.map((filter, i) => {
                  const isActive =
                    activeFilter === filter || (i === 0 && !activeFilter)
                  return (
                    <FilterChip
                      key={filter}
                      active={isActive}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-none font-mono text-[11px] uppercase tracking-[0.12em]"
                      onClick={() =>
                        propertySearch.chooseSearch({
                          filter,
                          location: propertySearch.state?.location ?? '',
                          query: propertySearch.state?.query ?? '',
                        })
                      }
                    >
                      {filter}
                    </FilterChip>
                  )
                })}
              </div>
            </div>
            <p
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 tabular-nums"
              aria-live="polite"
            >
              [ results ] {String(matchingListings.length).padStart(2, '0')}{' '}
              listing{matchingListings.length === 1 ? '' : 's'}
              {propertyActions.state?.savedCount
                ? ` · ${propertyActions.state.savedCount} saved`
                : ''}
            </p>
          </div>

          <ResponsiveGrid
            cols="1-2-3"
            className="mt-10 items-start gap-x-6 gap-y-10"
          >
            {matchingListings.map((listing, index) => (
              <ListingCard
                key={`${listing.address}-${index}`}
                variant="selectable-card"
                className={cn(
                  'rounded-none',
                  index % 3 === 1 && 'lg:translate-y-8',
                  index % 2 === 1 && 'sm:translate-y-6 lg:translate-y-0',
                  selectedAddress === listing.address
                    ? 'border-foreground shadow-[6px_6px_0_0] shadow-foreground/15'
                    : 'border-foreground/15',
                )}
              >
                <ListingCardMedia>
                  <Image
                    alt={`listing photo for ${listing.address}`}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {listing.tag ? (
                    <ListingCardBadge
                      variant="glass"
                      className="left-0 top-0 rounded-none border-b border-r border-foreground px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
                    >
                      {listing.tag}
                    </ListingCardBadge>
                  ) : null}
                  <PropertyListingSaveButton
                    lakebed={lakebed}
                    address={listing.address}
                    price={listing.price}
                    aria-pressed={savedAddresses.has(listing.address)}
                    aria-label={`Save ${listing.address}`}
                    className={cn(
                      'absolute right-3 top-3 grid size-9 place-items-center rounded-none border border-foreground/15 bg-background/90 backdrop-blur transition-colors hover:text-accent',
                      savedAddresses.has(listing.address)
                        ? 'text-accent'
                        : 'text-muted-foreground',
                    )}
                  >
                    <span aria-hidden="true">♥</span>
                  </PropertyListingSaveButton>
                </ListingCardMedia>
                <button
                  type="button"
                  aria-pressed={selectedAddress === listing.address}
                  onClick={() => {
                    void propertyActions.select({
                      address: listing.address,
                    })
                  }}
                  className="flex flex-1 flex-col border-t border-foreground/10 p-5 text-left"
                >
                  <div className="text-3xl font-extrabold leading-none tracking-tighter text-foreground tabular-nums">
                    {listing.price}
                  </div>
                  <ListingCardSpecRow
                    className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] tabular-nums"
                    specs={[
                      `${listing.beds} BD`,
                      `${listing.baths} BA`,
                      `${listing.sqft} SQFT`,
                    ]}
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {listing.address}
                  </p>
                </button>
                <div className="border-t border-foreground/10 px-5 py-4">
                  <PropertyListingInquiryButton
                    lakebed={lakebed}
                    address={listing.address}
                    intent="Contact agent"
                    source="listing-card"
                    pendingChildren={
                      <>
                        <PropertyListingMutationSpinner className="size-4" />
                        Sending
                      </>
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-none border border-foreground/25 bg-background px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-150 hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                  >
                    Contact agent
                  </PropertyListingInquiryButton>
                </div>
              </ListingCard>
            ))}
            {!matchingListings.length ? (
              <Card className="rounded-none border border-dashed border-foreground/25 bg-background p-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:col-span-2 lg:col-span-3">
                No listings match the current search.
              </Card>
            ) : null}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
