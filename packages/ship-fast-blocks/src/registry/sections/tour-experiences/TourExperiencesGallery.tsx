import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/** Bento span map — one dominant plate, then an asymmetric editorial mosaic. */
const SPANS = [
  'col-span-2 lg:col-span-7 lg:row-span-2',
  'col-span-2 sm:col-span-1 lg:col-span-5',
  'col-span-2 sm:col-span-1 lg:col-span-5',
  'col-span-2 sm:col-span-1 lg:col-span-4',
  'col-span-2 sm:col-span-1 lg:col-span-4',
  'col-span-2 sm:col-span-1 lg:col-span-4',
]

/**
 * TourExperiencesGallery — editorial-wanderlust destination mosaic for an
 * adventure / guided-tour brand. A mono metadata header above an asymmetric
 * bento of full-bleed alt-driven photo plates — one dominant plate anchoring the
 * grid, the rest staggered — each sharp-cornered with a mono museum-label
 * caption over a token gradient, spanning coastline, mountain trail, old town,
 * market, waterfall, and a sunset viewpoint. Use to sell the wanderlust of a
 * trip on tour-operator, expedition, and travel-experience landing pages.
 * Renders fully with no props via baked-in defaults.
 */
export const TourExperiencesGallery = defineCapsule({
  name: 'TourExperiencesGallery',
  description:
    'Editorial-wanderlust destination mosaic for an adventure / guided-tour brand: a mono metadata header above an asymmetric bento of full-bleed alt-driven photo plates — one dominant plate anchoring the grid, the rest staggered — each sharp-cornered with a mono museum-label caption over a token gradient, spanning coastline, mountain trail, old town, market, waterfall, and a sunset viewpoint. Use to sell the wanderlust of a trip on tour-operator, expedition, and travel-experience landing pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Destination tiles (alt drives the photo, caption is the overlay). */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string().optional() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'Dramatic turquoise coastline with cliffs plunging into the sea at golden hour',
            caption: 'Wild Coast Trail',
          },
          {
            alt: 'Hiker on a high alpine mountain trail with snow-capped peaks in the distance',
            caption: 'Summit Ridge Trek',
          },
          {
            alt: 'Sunlit cobblestone street in a historic European old town with pastel buildings',
            caption: 'Old Town Walk',
          },
          {
            alt: 'Bustling open-air street market stalls overflowing with spices, fruit, and textiles',
            caption: 'Market Food Tour',
          },
          {
            alt: 'Powerful jungle waterfall cascading into an emerald pool surrounded by greenery',
            caption: 'Hidden Falls',
          },
          {
            alt: 'Travelers watching a vivid orange sunset from a clifftop viewpoint over the ocean',
            caption: 'Sunset Viewpoint',
          },
        ]

    return (
      <section className="bg-muted/30 px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-24">
        <Container size="xl" className={props.className}>
          {/* Mono metadata header. */}
          <div className="mb-10 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 flex items-center gap-2 tracking-[0.18em]">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                Field notes
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {props.heading ?? 'Where the trail takes you'}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {props.subheading ??
                  'A glimpse of the places, plates, and panoramas waiting on our most-loved tours. Every photo is somewhere our guides will take you.'}
              </p>
            </div>
            <MonoTag
              tone="faint"
              aria-hidden="true"
              className="shrink-0 tracking-[0.18em]"
            >
              {String(images.length).padStart(2, '0')} destinations
            </MonoTag>
          </div>

          {/* Asymmetric full-bleed bento. */}
          <div className="grid auto-rows-[13rem] grid-cols-2 gap-3 sm:auto-rows-[15rem] lg:grid-cols-12">
            {images.map((img, i) => {
              const __iv__ = img as {
                alt: string
                caption?: string
                title?: string
                location?: string
              }
              return (
                <figure
                  key={__iv__.alt}
                  className={cn(
                    'group relative overflow-hidden border border-border',
                    SPANS[i % SPANS.length],
                  )}
                >
                  <Image
                    alt={__iv__.alt}
                    w={900}
                    h={700}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
                  />
                  {__iv__.caption && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-transparent px-4 pb-3.5 pt-12">
                      <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-background">
                        <span
                          aria-hidden="true"
                          className="size-1.5 bg-primary"
                        />
                        {__iv__.caption}
                      </span>
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
