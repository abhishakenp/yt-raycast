import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'
import { MasonryTile } from '#/section-kit/MasonryTile.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * BakeryGallery — masonry photo gallery for an artisan-bakery page, on a soft
 * muted band. A centered heading + lead paragraph above a 2/4-column grid of
 * staggered-height, rounded, lazy-loaded alt-driven photos that evoke the daily
 * process — mixing, shaping, baking, finished loaves and pastries. Warm,
 * editorial, light and craft-forward. All photography is alt-driven via the
 * Image component; no links. Use to show a behind-the-scenes / "inside the
 * bakery" photo wall for bakeries, patisseries, cafes, or any food maker.
 * Renders fully with no props via baked-in default photo alts.
 */
export const BakeryGallery = defineCapsule({
  name: 'BakeryGallery',
  description:
    "Masonry photo gallery for an artisan-bakery page on a soft muted band: a centered heading and lead paragraph above a 2/4-column grid of staggered-height, rounded, lazy-loaded alt-driven photos that evoke the daily process (mixing, shaping, baking, finished loaves and pastries). Warm, editorial, light and craft-forward; all photography is alt-driven via the Image component with no links. Use to show a behind-the-scenes / 'inside the bakery' photo wall for bakeries, patisseries, cafes, dessert studios, or any food maker.",
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

    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground lg:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <ResponsiveGrid cols="2-md-4" gap="sm">
            {[0, 1, 2, 3].map((col) => (
              <div key={col} className="space-y-4">
                <MasonryTile treatment={col % 2 === 0 ? 'h-64-xl' : 'h-48-xl'}>
                  <Image
                    alt={items[(col * 2) % items.length]}
                    w={400}
                    h={500}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </MasonryTile>
                <MasonryTile treatment={col % 2 === 0 ? 'h-48-xl' : 'h-64-xl'}>
                  <Image
                    alt={items[(col * 2 + 1) % items.length]}
                    w={400}
                    h={col % 2 === 0 ? 300 : 500}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </MasonryTile>
              </div>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
