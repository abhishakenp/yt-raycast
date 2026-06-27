import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * RealEstateGallery — featured-listings grid for a premium brokerage. A
 * centered serif header sits above a responsive 1/2/3-column grid of property
 * cards. Each card has an alt-driven photo with an optional corner badge (e.g.
 * "New" / "Open House"), a bold price, a beds / baths / sqft spec row, the
 * address, and a "View" link that routes through useNavigate. Use to showcase
 * featured or recently listed homes on a brokerage or agent site. Renders fully
 * with no props via baked-in defaults (six listings).
 */
export const RealEstateGallery = defineCapsule({
  name: 'RealEstateGallery',
  description:
    "Featured-listings grid for a premium brokerage: a centered serif header above a responsive 1/2/3-column grid of property cards. Each card has an alt-driven photo with an optional corner badge, a bold price, a beds / baths / sqft spec row, the address, and a 'View' link that routes through useNavigate. Use to showcase featured or recently listed homes on a brokerage or agent site.",
  props: z.object({
    /** Section heading (serif, large). */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    description: z.string().optional(),
    /** Listing cards. */
    listings: z
      .array(
        z.object({
          price: z.string(),
          beds: z.string(),
          baths: z.string(),
          sqft: z.string(),
          address: z.string(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Label for the per-card view link. */
    viewLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Featured listings'
    const description =
      props.description ??
      'A handpicked selection of homes just hitting the market across our most sought-after neighborhoods.'
    const viewLabel = props.viewLabel ?? 'View'
    const listings = props.listings?.length
      ? props.listings
      : [
          {
            price: '$1,250,000',
            beds: '4',
            baths: '3',
            sqft: '2,840',
            address: '812 Linden Avenue, Oak Park',
            badge: 'New',
          },
          {
            price: '$865,000',
            beds: '3',
            baths: '2',
            sqft: '1,920',
            address: '47 Crestview Terrace, Hillcrest',
            badge: 'Open House',
          },
          {
            price: '$2,100,000',
            beds: '5',
            baths: '4',
            sqft: '3,650',
            address: '1900 Harborline Drive, Bayshore',
          },
          {
            price: '$540,000',
            beds: '2',
            baths: '2',
            sqft: '1,150',
            address: '305 Mill Street #4B, Riverside',
            badge: 'New',
          },
          {
            price: '$1,475,000',
            beds: '4',
            baths: '3',
            sqft: '2,980',
            address: '62 Magnolia Court, Westfield',
          },
          {
            price: '$725,000',
            beds: '3',
            baths: '2',
            sqft: '1,740',
            address: '118 Sutter Lane, Greenwood',
          },
        ]

    return (
      <section className={cn('bg-background py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            {description ? (
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {listings.map((listing, index) => (
              <article
                key={`${listing.address}-${index}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    alt={`exterior photo of the home at ${listing.address}`}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {listing.badge ? (
                    <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      {listing.badge}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="text-xl font-semibold text-foreground">
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
                  <button
                    type="button"
                    onClick={() => go('Listing')}
                    className="mt-5 inline-flex w-fit items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {viewLabel}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
