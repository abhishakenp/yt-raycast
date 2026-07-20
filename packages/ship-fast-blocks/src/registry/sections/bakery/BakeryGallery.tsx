import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MasonryTile } from '#/section-kit/MasonryTile.tsx'
import {
  GalleryMasonry,
  GalleryMasonryColumn,
} from '#/section-kit/GalleryGrid.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * BakeryGallery — masonry photo wall for an artisan-bakery page, in a
 * playful-geometric warm language on a soft primary-washed band. An
 * asymmetric heading row: a mono "04 / Gallery" index above an oversized
 * serif heading on the left, with the lead paragraph and a rotated
 * rounded-full photo-count sticker chip on the right. Below, a 2/4-column
 * masonry of staggered-height, chunky-bordered, alt-driven photos mixing
 * arch-topped (rounded-t-full) tiles with sharp-cornered blob tiles — the
 * playful round-vs-sharp geometry — over a giant ghost flour-star watermark.
 * All photography is alt-driven via the Image component; no links. Use to
 * show a behind-the-scenes / "inside the bakery" photo wall for bakeries,
 * patisseries, cafes, or any food maker. Renders fully with no props via
 * baked-in default photo alts.
 */
export const BakeryGallery = defineCapsule({
  name: 'BakeryGallery',
  description:
    "Masonry photo wall for an artisan-bakery page in a playful-geometric warm language on a soft primary-washed band: an asymmetric heading row with a mono index tag and oversized serif heading on the left plus the lead paragraph and a rotated rounded-full photo-count sticker chip on the right, above a 2/4-column masonry of staggered-height, chunky-bordered, lazy-loaded alt-driven photos that mix arch-topped tiles with sharp-cornered blob tiles over a giant ghost flour-star watermark. All photography is alt-driven via the Image component with no links. Use to show a behind-the-scenes / 'inside the bakery' photo wall for bakeries, patisseries, cafes, dessert studios, or any food maker.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Alt texts driving the gallery photos. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Inside the bakery'
    const description =
      props.description ??
      'A glimpse into our daily process, from mixing to the final loaf.'
    const items = props.items?.length
      ? props.items
      : [
          "Baker's hands shaping round sourdough bread boules on a floured wooden work surface",
          'Close-up of golden brown artisan bread crust showing detailed scoring pattern',
          'Rows of fresh buttery croissants cooling on a wire rack in a bakery kitchen',
          'Rustic bakery interior with wooden shelves displaying various artisan bread loaves',
          'Freshly baked sourdough bread loaves with dark crusty exterior arranged on linen',
          'Baker mixing bread dough in a large stainless steel bowl with flour',
          'Assorted colorful French macarons displayed in a glass case at a pastry shop',
          'Decorated layered chocolate cake with frosting and fresh berries on a cake stand',
        ]

    /* Round-vs-sharp tile geometry: arch tops alternate with blob corners. */
    const tileShapes = [
      'rounded-t-full rounded-b-2xl',
      'rounded-2xl rounded-tl-none',
      'rounded-2xl rounded-br-none',
      'rounded-t-full rounded-b-2xl',
      'rounded-2xl rounded-bl-none',
      'rounded-t-full rounded-b-2xl',
      'rounded-2xl rounded-tr-none',
      'rounded-2xl rounded-bl-none',
    ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-primary/5 py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark
          aria-hidden="true"
          className="-left-16 bottom-0 font-serif text-[12rem] italic sm:text-[18rem]"
        >
          ❋
        </Watermark>
        <Container className="relative">
          <div className="mb-12 grid gap-5 lg:mb-14 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-7">
              <MonoTag>04 / Gallery</MonoTag>
              <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            </div>
            <div className="flex items-end justify-between gap-4 lg:col-span-5 lg:flex-col lg:items-end lg:gap-3">
              <p className="max-w-sm text-base leading-relaxed text-muted-foreground lg:text-right">
                {description}
              </p>
              <span className="inline-flex shrink-0 rotate-2 items-center rounded-full border-2 border-foreground/20 bg-background px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground shadow-[3px_3px_0_0] shadow-foreground/10">
                {String(items.length).padStart(2, '0')} photos
              </span>
            </div>
          </div>

          <GalleryMasonry columns="2-4">
            {[0, 1, 2, 3].map((col) => (
              <GalleryMasonryColumn
                key={col}
                className={col % 2 === 1 ? 'sm:translate-y-8' : undefined}
              >
                <MasonryTile
                  treatment={col % 2 === 0 ? 'h-64-xl' : 'h-48-xl'}
                  className={cn(
                    'border-2 border-foreground/10',
                    tileShapes[(col * 2) % tileShapes.length],
                  )}
                >
                  <Image
                    alt={items[(col * 2) % items.length]}
                    w={400}
                    h={500}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </MasonryTile>
                <MasonryTile
                  treatment={col % 2 === 0 ? 'h-48-xl' : 'h-64-xl'}
                  className={cn(
                    'border-2 border-foreground/10',
                    tileShapes[(col * 2 + 1) % tileShapes.length],
                  )}
                >
                  <Image
                    alt={items[(col * 2 + 1) % items.length]}
                    w={400}
                    h={col % 2 === 0 ? 300 : 500}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </MasonryTile>
              </GalleryMasonryColumn>
            ))}
          </GalleryMasonry>
        </Container>
      </section>
    )
  },
})
