import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
} from '#/section-kit/GalleryGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * RealEstateGallery — editorial featured-listings grid for a luxury brokerage.
 * An asymmetric header (mono index rail + serif heading left, supporting line
 * right) sits above a staggered 1/2/3-column grid of property plates. Each
 * sharp-cornered plate pairs an alt-driven photo (with an optional mono corner
 * badge) with a spec block: a giant tabular price, a collapsed-border BEDS /
 * BATHS / SQFT ledger with mono labels and tabular values, the address, and a
 * "View" link that routes through section-kit route links to the listing. Use to
 * showcase featured or recently listed homes on a brokerage or agent site.
 * Renders fully with no props via baked-in defaults (six listings).
 */
export const RealEstateGallery = defineCapsule({
  name: 'RealEstateGallery',
  description:
    "Editorial featured-listings grid for a luxury brokerage: an asymmetric header (mono index rail + serif heading left, supporting line right) above a staggered 1/2/3-column grid of sharp-cornered property plates. Each plate pairs an alt-driven photo (with an optional mono corner badge) with a spec block: a giant tabular price, a collapsed-border BEDS / BATHS / SQFT ledger with mono labels and tabular values, the address, and a 'View' link that routes through section-kit route links to the listing. Use to showcase featured or recently listed homes on a brokerage or agent site.",
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
      <section
        className={cn(
          'bg-background pt-24 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          {/* Asymmetric editorial header. */}
          <div className="mb-12 grid items-end gap-6 border-b border-border pb-8 lg:grid-cols-12 lg:gap-12 lg:mb-16">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 bg-primary"
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Listings
                </span>
              </div>
              <h2 className="mt-5 max-w-xl font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {description}
            </p>
          </div>

          <GalleryGrid>
            <GalleryGridItems columns={3} className="gap-x-6 gap-y-12">
              {listings.map((listing, i) => {
                const specs = [
                  { label: 'Beds', value: listing.beds },
                  { label: 'Baths', value: listing.baths },
                  { label: 'Sqft', value: listing.sqft },
                ]
                return (
                  <article
                    key={`${listing.address}-${i}`}
                    className={cn(
                      'group flex flex-col',
                      i % 3 === 1 && 'lg:translate-y-12',
                    )}
                  >
                    <GalleryTile className="aspect-[4/3] rounded-none border-border bg-muted">
                      <GalleryTileImage alt={listing.address} />
                      {listing.badge ? (
                        <span className="absolute left-0 top-0 bg-foreground px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-background">
                          {listing.badge}
                        </span>
                      ) : null}
                    </GalleryTile>

                    <div className="mt-5 flex items-baseline justify-between gap-4">
                      <p className="font-semibold tabular-nums tracking-tight text-foreground text-2xl sm:text-3xl">
                        {listing.price}
                      </p>
                      <NavbarRouteLink
                        href={listing.address}
                        className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {viewLabel}
                        <span aria-hidden="true">&#8594;</span>
                      </NavbarRouteLink>
                    </div>

                    {/* Collapsed-border spec ledger. */}
                    <dl className="mt-4 grid grid-cols-3 border-l border-t border-border">
                      {specs.map((spec) => (
                        <div
                          key={spec.label}
                          className="border-b border-r border-border px-3 py-2.5"
                        >
                          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                            {spec.label}
                          </dt>
                          <dd className="mt-0.5 tabular-nums text-sm font-medium text-foreground">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <p className="mt-4 text-sm text-muted-foreground">
                      {listing.address}
                    </p>
                  </article>
                )
              })}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
