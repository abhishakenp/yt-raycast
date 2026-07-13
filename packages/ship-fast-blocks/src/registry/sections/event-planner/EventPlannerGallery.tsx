import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * EventPlannerGallery — portfolio gallery of past events. A centered intro
 * (uppercase eyebrow, thin light heading, lede) above a masonry-style grid where
 * alternating tiles vary in height (tall/short) for visual rhythm, followed by a
 * second wide 3-up row (the last tile spanning two columns on mobile). Every tile
 * is a clickable, hover-zoom rounded photo routed through useNavigate; imagery is
 * alt-driven. Use to showcase recent weddings, galas and celebrations for event
 * planners or hospitality brands.
 */
export const EventPlannerGallery = defineCapsule({
  name: 'EventPlannerGallery',
  description:
    'Portfolio gallery of past events: a centered intro (uppercase eyebrow, thin light heading, lede) above a masonry-style grid where alternating tiles vary in height for visual rhythm, followed by a second wide 3-up row (the last tile spanning two columns on mobile). Every tile is a clickable, hover-zoom rounded photo routed through useNavigate; all imagery is alt-driven. Use to showcase recent weddings, galas and celebrations for event/wedding planners or premium hospitality brands.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    wideImages: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const galleryEyebrow = props.eyebrow ?? 'Portfolio'
    const galleryHeading = props.heading ?? 'Recent Events'
    const galleryDesc =
      props.description ??
      "A glimpse into celebrations we've crafted for clients who trusted us with their most important moments."
    const galleryImages = props.images?.length
      ? props.images
      : [
          'Garden wedding ceremony with white rose arch and guests seated on lawn at sunset',
          'Elegant place setting with gold flatware and white linen at formal dinner',
          'Luxury corporate gala with dramatic uplighting and decorated tables',
          'Intimate candlelit dinner party with elegant floral centerpieces',
          'Beach wedding ceremony with ocean backdrop and flowing white fabric arch',
          'Beautiful wedding cake with white frosting and fresh flowers on decorated table',
          'Outdoor reception tent with elegant lighting and decorated tables at twilight',
          'Elegant ballroom wedding reception with crystal chandeliers and long dining tables',
        ]
    const galleryWide = props.wideImages?.length
      ? props.wideImages
      : [
          'Live band performing at elegant wedding reception with dancing guests',
          'Rustic barn wedding reception with string lights and wooden tables',
          'Champagne tower celebration at luxury corporate event',
        ]

    return (
      <section
        className={cn(
          'px-4 pt-28 pb-20 sm:px-6 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {galleryEyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
              {galleryHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{galleryDesc}</p>
          </div>
          <ResponsiveGrid cols="2-lg-4" gap="sm" className="lg:gap-6">
            {galleryImages.map((alt, i) => (
              <button
                key={alt}
                type="button"
                onClick={() => go(galleryHeading)}
                className="overflow-hidden rounded-xl"
              >
                <Image
                  alt={alt}
                  w={400}
                  h={i % 2 === 0 ? 600 : 400}
                  loading="lazy"
                  className={cn(
                    'w-full object-cover transition-transform duration-500 hover:scale-105',
                    i % 2 === 0 ? 'h-64 lg:h-80' : 'h-48 lg:h-56',
                  )}
                />
              </button>
            ))}
          </ResponsiveGrid>
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
            {galleryWide.map((alt, i) => (
              <button
                key={alt}
                type="button"
                onClick={() => go(galleryHeading)}
                className={cn(
                  'overflow-hidden rounded-xl',
                  i === 2 && 'col-span-2 lg:col-span-1',
                )}
              >
                <Image
                  alt={alt}
                  w={600}
                  h={400}
                  loading="lazy"
                  className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105 lg:h-64"
                />
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
