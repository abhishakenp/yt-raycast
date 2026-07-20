import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * EventPlannerGallery — kinetic-poster portfolio gallery of past events. An
 * asymmetric intro (a mono metadata rail with a primary square, hairline rule and
 * frame count above a giant tight-tracked heading and lede, over a faint "WORK"
 * watermark) above a staggered masonry grid of hard-framed rounded-none plates
 * where alternating tiles vary in height and offset for visual rhythm, followed
 * by a second wide 3-up row. Every tile is a clickable, hover-zoom bordered photo
 * routed through section-kit route links; imagery is alt-driven. Use to showcase
 * recent weddings, galas and celebrations for event planners or hospitality brands.
 */
export const EventPlannerGallery = defineCapsule({
  name: 'EventPlannerGallery',
  description:
    'Kinetic-poster portfolio gallery of past events: an asymmetric intro (a mono metadata rail with a primary square, hairline rule and frame count above a giant tight-tracked heading and lede, over a faint "WORK" watermark) above a staggered masonry grid of hard-framed rounded-none plates where alternating tiles vary in height and offset for visual rhythm, followed by a second wide 3-up row. Every tile is a clickable, hover-zoom bordered photo routed through section-kit route links; all imagery is alt-driven. Use to showcase recent weddings, galas and celebrations for event/wedding planners or premium hospitality brands.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    wideImages: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
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
          'relative overflow-hidden px-4 pt-28 pb-20 sm:px-6 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <span className="absolute -left-4 top-10 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.035] text-[9rem] sm:text-[13rem] lg:text-[17rem]">
            WORK
          </span>
        </div>
        <Container size="xl" className="relative">
          <div className="mb-14 max-w-3xl lg:mb-20">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 bg-primary"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {galleryEyebrow}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
              >
                {String(galleryImages.length + galleryWide.length).padStart(
                  2,
                  '0',
                )}{' '}
                frames
              </span>
            </div>
            <h2 className="mt-6 text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground text-balance sm:text-5xl lg:text-6xl">
              {galleryHeading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {galleryDesc}
            </p>
          </div>
          <ResponsiveGrid cols="2-lg-4" className="items-start gap-4 lg:gap-5">
            {galleryImages.map((alt, i) => (
              <NavbarRouteLink
                key={alt}
                className={cn(
                  'group block overflow-hidden rounded-none border-2 border-foreground/15 transition-colors duration-150 hover:border-foreground/40',
                  i % 4 === 1 && 'lg:translate-y-8',
                  i % 4 === 3 && 'lg:translate-y-4',
                )}
                href={galleryHeading}
              >
                <Image
                  alt={alt}
                  w={400}
                  h={i % 2 === 0 ? 600 : 400}
                  loading="lazy"
                  className={cn(
                    'w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none',
                    i % 2 === 0 ? 'h-64 lg:h-80' : 'h-48 lg:h-56',
                  )}
                />
              </NavbarRouteLink>
            ))}
          </ResponsiveGrid>
          <GalleryGrid className="mt-16 lg:mt-20">
            <GalleryGridItems columns={3} className="gap-4 lg:gap-5">
              {galleryWide
                .map((alt) => ({ alt }))
                .map((img) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  return (
                    <GalleryTile
                      key={__iv__.alt}
                      className="overflow-hidden rounded-none border-2 border-foreground/15"
                    >
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
