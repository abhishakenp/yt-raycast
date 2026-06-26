import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

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
export const HotelResortGallery = defineComponent({
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
      <section className={cn('py-24 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-light text-foreground lg:text-4xl">
              {heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {images.map((alt, i) => (
              <div
                key={alt}
                className={cn(
                  i === 0 && 'lg:col-span-2 lg:row-span-2',
                  (i === 5 || i === 6) && 'lg:col-span-2',
                )}
              >
                <Image
                  alt={alt}
                  w={i === 0 ? 1200 : 800}
                  h={i === 0 ? 1200 : 600}
                  loading="lazy"
                  className={cn(
                    'w-full rounded-lg object-cover',
                    i === 0
                      ? 'min-h-[300px] lg:size-full lg:min-h-full'
                      : 'h-48 lg:h-56',
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
