import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * RealEstateGallery — featured-listings grid for a premium brokerage. A
 * centered serif header sits above a responsive 1/2/3-column grid of property
 * cards. Each card has an alt-driven photo with an optional corner badge (e.g.
 * "New" / "Open House"), a bold price, a beds / baths / sqft spec row, the
 * address, and a "View" link that routes through section-kit route links. Use to showcase
 * featured or recently listed homes on a brokerage or agent site. Renders fully
 * with no props via baked-in defaults (six listings).
 */
export const RealEstateGallery = defineCapsule({
  name: 'RealEstateGallery',
  description:
    "Featured-listings grid for a premium brokerage: a centered serif header above a responsive 1/2/3-column grid of property cards. Each card has an alt-driven photo with an optional corner badge, a bold price, a beds / baths / sqft spec row, the address, and a 'View' link that routes through section-kit route links. Use to showcase featured or recently listed homes on a brokerage or agent site.",
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
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mx-auto max-w-2xl gap-0"
            titleClassName="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            subtitleClassName="mt-4 text-base text-muted-foreground sm:text-lg"
          />

          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {listings
                .map((l) => ({ alt: l.address, caption: l.price }))
                .map((img) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  return (
                    <GalleryTile key={__iv__.alt}>
                      <GalleryTileImage alt={__iv__.alt} />
                      {__iv__.caption && (
                        <GalleryTileCaption>
                          {__iv__.caption}
                        </GalleryTileCaption>
                      )}
                    </GalleryTile>
                  )
                })}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
