import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * VacationRentalGallery — an editorial-wanderlust property gallery for a
 * vacation-rental listing page. An asymmetric mono-eyebrow intro row sits above a
 * staggered bento of full-bleed alt-driven property plates (living room,
 * bedroom, pool, kitchen, deck view, bathroom): the first plate runs wide, the
 * rest alternate with a vertical offset, each sharp-cornered with a hover zoom
 * and a rotated mono caption stamp. Theme-token only. Use to showcase the spaces
 * of a vacation rental, beach house, cabin, villa, or boutique short-stay.
 * Renders fully with no props via baked-in defaults.
 */
const LG_COLS = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
} as const

export const VacationRentalGallery = defineCapsule({
  name: 'VacationRentalGallery',
  description:
    'Editorial-wanderlust property gallery for a vacation-rental listing page: an asymmetric mono-eyebrow intro row above a staggered bento of full-bleed alt-driven property plates (living room, bedroom, pool, kitchen, deck view, bathroom) — the first plate runs wide, the rest alternate with a vertical offset, each sharp-cornered with a hover zoom and a rotated mono caption stamp. Theme-token only. Use to showcase the spaces of a vacation rental, beach house, cabin, villa, or boutique short-stay.',
  props: z.object({
    /** Section heading above the gallery. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Gallery tiles: each an alt (drives the photo) plus an optional caption. */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string().optional() }))
      .optional(),
    /** Column count for the responsive grid. */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'Sunlit open-plan living room with linen sofas and ocean-view windows',
            caption: 'Living room',
          },
          {
            alt: 'Serene master bedroom with a king bed, white linens, and morning light',
            caption: 'Master bedroom',
          },
          {
            alt: 'Infinity pool overlooking a turquoise bay at golden hour',
            caption: 'Pool & terrace',
          },
          {
            alt: 'Bright modern kitchen with marble island and bar stools',
            caption: "Chef's kitchen",
          },
          {
            alt: 'Wooden deck with lounge chairs and a panoramic coastline view',
            caption: 'Deck & view',
          },
          {
            alt: 'Spa-style bathroom with a freestanding soaking tub and natural light',
            caption: 'Ensuite bath',
          },
        ]

    const columns = props.columns ?? 3
    const heading = props.heading ?? 'Take the tour'
    const subheading =
      props.subheading ??
      'Every corner designed for comfort, from sun-drenched living spaces to a pool that opens to the horizon.'

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 grid items-end gap-6 lg:mb-16 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <MonoTag className="mb-4 block">Gallery / Spaces</MonoTag>
              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {subheading}
            </p>
          </div>

          <div
            className={cn('grid grid-cols-2 gap-3 sm:gap-4', LG_COLS[columns])}
          >
            {images.map((img, i) => {
              const __iv__ = img as {
                alt: string
                caption?: string
                title?: string
                location?: string
              }
              return (
                <GalleryTile
                  key={__iv__.alt}
                  className={cn(
                    'rounded-none border-border',
                    i === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-[4/3]',
                    i % 2 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <GalleryTileImage alt={__iv__.alt} />
                  {__iv__.caption && (
                    <GalleryTileCaption className="inset-x-auto bottom-3 left-3 w-fit -rotate-1 rounded-none border border-background/40 bg-foreground/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-background backdrop-blur-sm">
                      {__iv__.caption}
                    </GalleryTileCaption>
                  )}
                </GalleryTile>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
