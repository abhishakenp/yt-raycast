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
 * HotelResortGallery — masonry photo gallery for a luxury hotel / resort & spa
 * site. A left-aligned eyebrow + thin heading + paragraph, then a responsive
 * grid where the first image spans 2x2 as a tall feature and the last two
 * images span a double column, the rest sized uniformly — an airy editorial
 * mosaic. Use to show off property, rooms, spa, dining and beach photography
 * for hotels, resorts, spa retreats, inns, or wellness destinations. Imagery
 * uses the alt-driven Image component. Renders fully with no props via baked-in
 * resort defaults.
 */
export const HotelResortGallery = defineCapsule({
  name: 'HotelResortGallery',
  description:
    'Masonry photo gallery for a luxury hotel / resort & spa site: a left-aligned uppercase eyebrow + thin heading + paragraph, then a responsive grid where the first image spans 2x2 as a tall feature and the last two span a double column with the rest sized uniformly — an airy editorial mosaic. Imagery uses the alt-driven Image component. Use to show off property, rooms, spa, dining and beach photography for hotels, resorts, spa retreats, inns, or wellness destinations.',
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Alt texts driving the gallery images (first spans 2x2; last two span wide). */
    images: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Gallery'
    const heading = props.heading ?? 'A glimpse of paradise'
    const description =
      props.description ??
      'Experience the beauty of Azure Coast through moments captured by our guests and photographers.'
    const images = props.images?.length
      ? props.images
      : [
          'Stunning aerial view of resort pool deck and beach with turquoise Pacific Ocean',
          'Elegant resort lounge area with comfortable seating and ocean sunset views',
          'Luxury spa massage room with warm lighting and natural decor elements',
          'Gourmet plated dish with fresh seafood and seasonal vegetables',
          'Golden hour on private beach with gentle waves and empty lounge chairs',
          'Resort exterior architecture with white walls and palm trees at sunset',
          'Couple enjoying sunset cocktails on private balcony overlooking ocean',
        ]

    return (
      <section className={cn('pt-28 pb-24 lg:pt-32 lg:pb-28', props.className)}>
        <Container size="xl" className="px-6">
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mb-16 max-w-2xl gap-0"
            eyebrowClassName="mb-3 text-sm uppercase tracking-widest text-muted-foreground"
            titleClassName="mb-4 text-3xl font-light text-foreground lg:text-4xl"
            subtitleClassName="leading-relaxed text-muted-foreground"
          />
          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {images
                .map((alt) => ({ alt }))
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
