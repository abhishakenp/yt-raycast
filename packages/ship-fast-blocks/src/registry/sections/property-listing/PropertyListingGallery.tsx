import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { FilterChip, ResponsiveGrid } from '#/section-kit/index.ts'
import {
  ListingCard,
  ListingCardBadge,
  ListingCardMedia,
  ListingCardSpecRow,
} from '#/section-kit/ListingCard.tsx'
import type { PropertyListingCatalogInput } from './property-listing-lakebed.ts'
import { propertyListingLakebed, type PropertyListingRecord } from './property-listing-lakebed.ts'
import {
  PropertyListingInquiryButton,
  PropertyListingMutationSpinner,
  PropertyListingSaveButton,
  usePropertyListingActions,
  usePropertyListingSearch,
  useSyncPropertyListings,
} from './property-listing-interactions.tsx'

/**
 * PropertyListingGallery — search-results grid for a property marketplace. A
 * header row pairs a heading with a horizontal filter-chip strip (For Sale /
 * For Rent / type / price), above a dense responsive 1/2/3-column grid of
 * listing cards. Each card has an alt-driven photo with an optional corner tag
 * and a save-heart button, a bold price, a beds / baths / sqft spec row, and
 * the address. Filter chips update shared Lakebed search state; save-heart and
 * cards update saved/selected listing state. Use to render listing results in a
 * search portal.
 */
export const PropertyListingGallery = defineCapsule({
  name: 'PropertyListingGallery',
  description:
    'Search-results grid for a property marketplace: a header row pairing a heading with a horizontal filter-chip strip, above a dense responsive 1/2/3-column grid of listing cards. Each card has an alt-driven photo with an optional corner tag and a save-heart button, a bold price, a beds / baths / sqft spec row, and the address. Filter chips update shared Lakebed listing search state; save-heart and cards update saved/selected listing state. Use to render listing results in a search portal.',
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
    const catalog: PropertyListingRecord[] = lakebed.useQuery('propertyCatalog') ?? []
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
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {heading}
            </h2>
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

          <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
            {matchingListings.length} listing
            {matchingListings.length === 1 ? '' : 's'} match the current search
            {propertyActions.state?.savedCount
              ? ` · ${propertyActions.state.savedCount} saved`
              : ''}
          </p>

          <ResponsiveGrid cols="1-2-3" gap="md" className="mt-10">
            {matchingListings.map((listing, index) => (
              <ListingCard
                key={`${listing.address}-${index}`}
                variant="selectable-card"
                className={cn(
                  selectedAddress === listing.address
                    ? 'border-primary shadow-md'
                    : 'border-border',
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
                    <ListingCardBadge variant="glass">
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
                      'absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/90 backdrop-blur transition-colors hover:text-accent',
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
                  className="flex flex-1 flex-col p-5 text-left"
                >
                  <div className="text-lg font-bold text-foreground">
                    {listing.price}
                  </div>
                  <ListingCardSpecRow
                    specs={[
                      `${listing.beds} bd`,
                      `${listing.baths} ba`,
                      `${listing.sqft} sqft`,
                    ]}
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {listing.address}
                  </p>
                </button>
                <div className="border-t border-border px-5 py-4">
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
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
                  >
                    Contact agent
                  </PropertyListingInquiryButton>
                </div>
              </ListingCard>
            ))}
            {!matchingListings.length ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
                No listings match the current search.
              </div>
            ) : null}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
