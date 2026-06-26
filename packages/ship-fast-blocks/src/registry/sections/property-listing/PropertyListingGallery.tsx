import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * PropertyListingGallery — search-results grid for a property marketplace. A
 * header row pairs a heading with a horizontal filter-chip strip (For Sale /
 * For Rent / type / price), above a dense responsive 1/2/3-column grid of
 * listing cards. Each card has an alt-driven photo with an optional corner tag
 * and a save-heart button, a bold price, a beds / baths / sqft spec row, and
 * the address. Filter chips, the heart, and cards route through useNavigate.
 * Use to render listing results in a search portal. Renders fully with no props.
 */
export const PropertyListingGallery = defineComponent({
  name: 'PropertyListingGallery',
  description:
    'Search-results grid for a property marketplace: a header row pairing a heading with a horizontal filter-chip strip, above a dense responsive 1/2/3-column grid of listing cards. Each card has an alt-driven photo with an optional corner tag and a save-heart button, a bold price, a beds / baths / sqft spec row, and the address. Filter chips, the heart, and cards route through useNavigate. Use to render listing results in a search portal.',
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
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Homes for you'
    const filters = props.filters?.length
      ? props.filters
      : ['For Sale', 'For Rent', 'Any type', 'Beds', 'Price', 'More']
    const listings = props.listings?.length
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

    return (
      <section className={cn('bg-muted py-16 lg:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {heading}
            </h2>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter, i) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => go('For Sale')}
                  className={cn(
                    'inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                    i === 0
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-muted',
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, index) => (
              <article
                key={`${listing.address}-${index}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    alt={`listing photo for ${listing.address}`}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {listing.tag ? (
                    <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                      {listing.tag}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => go('Saved')}
                    aria-label={`Save ${listing.address}`}
                    className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/90 text-muted-foreground backdrop-blur transition-colors hover:text-accent"
                  >
                    <span aria-hidden="true">♥</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => go('Listing')}
                  className="flex flex-1 flex-col p-5 text-left"
                >
                  <div className="text-lg font-bold text-foreground">
                    {listing.price}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span>{listing.beds} bd</span>
                    <span aria-hidden="true" className="h-3 w-px bg-border" />
                    <span>{listing.baths} ba</span>
                    <span aria-hidden="true" className="h-3 w-px bg-border" />
                    <span>{listing.sqft} sqft</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {listing.address}
                  </p>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
