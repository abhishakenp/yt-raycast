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
 * HotelResortGallery — full-bleed editorial photo mosaic for a luxury hotel /
 * resort & spa site. An asymmetric intro row (mono eyebrow + thin serif heading
 * on the left, supporting paragraph on the right), then a sharp-cornered
 * responsive grid where every fifth plate widens to a cinematic double-column
 * feature and the rest sit in a 4:3 rhythm, each tagged with a mono index
 * numeral and zooming gently on hover — an airy editorial mosaic. Use to show
 * off property, rooms, spa, dining and beach photography for hotels, resorts,
 * spa retreats, inns, or wellness destinations. Imagery uses the alt-driven
 * Image component. Renders fully with no props via baked-in resort defaults.
 */
export const HotelResortGallery = defineCapsule({
  name: 'HotelResortGallery',
  description:
    'Full-bleed editorial photo mosaic for a luxury hotel / resort & spa site: an asymmetric intro row (mono eyebrow + thin serif heading on the left, supporting paragraph on the right), then a sharp-cornered responsive grid where every fifth plate widens to a cinematic double-column feature and the rest sit in a 4:3 rhythm, each tagged with a mono index numeral and zooming gently on hover. Imagery uses the alt-driven Image component. Use to show off property, rooms, spa, dining and beach photography for hotels, resorts, spa retreats, inns, or wellness destinations.',
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
      <section className={cn('pt-24 pb-24 lg:pt-28 lg:pb-28', props.className)}>
        <Container size="xl" className="px-6">
          <div className="mb-16 grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              className="gap-3 lg:col-span-7"
              eyebrowClassName="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground"
              titleClassName="font-serif text-4xl font-normal text-foreground tracking-tight lg:text-5xl"
            />
            <p className="text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {description}
            </p>
          </div>
          <GalleryGrid>
            <GalleryGridItems columns={4} className="gap-3">
              {images
                .map((alt) => ({ alt }))
                .map((img, i) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  const feature = i % 5 === 0
                  return (
                    <GalleryTile
                      key={__iv__.alt}
                      className={cn(
                        'rounded-none border-0 bg-muted',
                        feature
                          ? 'aspect-[16/10] sm:col-span-2'
                          : 'aspect-[4/3]',
                      )}
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      <span
                        aria-hidden="true"
                        className="absolute left-3 top-3 font-mono text-[11px] uppercase tracking-[0.14em] text-background/90"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {__iv__.caption && (
                        <GalleryTileCaption className="rounded-none font-mono text-[11px] uppercase tracking-[0.12em]">
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
