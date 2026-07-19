import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CleaningServiceGallery — a before/after transformations image gallery for a home-cleaning / maid-service landing page. A centered heading + lead paragraph above a responsive 1/2/3-column grid of clickable project cards; each card shows a lazy-loaded image that subtly zooms on hover, with a gradient-to-top overlay that fades in to reveal a title and location caption. Every card routes through section-kit route links on click. Use for portfolio / results galleries for residential cleaning companies, maid services, renovation cleaners, or home-service brands that want visual proof. Renders fully with no props via six baked-in default transformations.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
export const CleaningServiceGallery = defineCapsule({
  name: 'CleaningServiceGallery',
  description:
    'A before/after transformations image gallery for a home-cleaning / maid-service landing page: centered heading + lead above a responsive 1/2/3-column grid of clickable project cards. Each card has a lazy-loaded image that zooms on hover with a gradient-to-top overlay that fades in, revealing a title and location caption. Cards route through section-kit route links on click. Use for portfolio / results galleries for residential cleaning, maid services, renovation cleaners, or home-service brands that want visual proof.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Gallery items: title + location + alt text for the image. */
    items: z
      .array(
        z.object({
          title: z.string(),
          location: z.string(),
          alt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Transformations that speak for themselves'
    const description =
      props.description ??
      'See the difference professional cleaning makes in real homes across Seattle.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Kitchen Deep Clean',
            location: 'Capitol Hill, Seattle',
            alt: 'before and after comparison of kitchen deep cleaning showing greasy stove to sparkling clean',
          },
          {
            title: 'Bathroom Revival',
            location: 'Ballard, Seattle',
            alt: 'pristine bathroom with white subway tiles and clean glass shower enclosure',
          },
          {
            title: 'Living Room Refresh',
            location: 'Fremont, Seattle',
            alt: 'freshly cleaned living room with organized furniture and dust-free surfaces',
          },
          {
            title: 'Home Office Clean',
            location: 'Queen Anne, Seattle',
            alt: 'clean home office with organized desk and dusted shelves',
          },
          {
            title: 'Floor Restoration',
            location: 'Green Lake, Seattle',
            alt: 'sparkling hardwood floors after professional mopping in open concept space',
          },
          {
            title: 'Master Bedroom',
            location: 'Wallingford, Seattle',
            alt: 'immaculate bedroom with freshly laundered white linens and organized nightstands',
          },
        ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {items.map((img) => {
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
                      <GalleryTileCaption>{__iv__.caption}</GalleryTileCaption>
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
