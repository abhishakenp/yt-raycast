import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * ElectronicsStoreGallery — a "Featured Collections" masonry gallery on a muted
 * band for an electronics storefront. A left-aligned heading above a 2-to-3
 * column grid of clickable image tiles where the first tile is a tall 3:4 feature
 * spanning two rows and the rest are 4:3, each under a bottom-up foreground
 * gradient with the collection name and product count overlaid. Tiles route
 * through useNavigate. Use to merchandise curated edits on electronics or gadget
 * storefronts.
 */
export const ElectronicsStoreGallery = defineCapsule({
  name: 'ElectronicsStoreGallery',
  description:
    'Featured Collections masonry gallery on a muted band for an electronics storefront: a left-aligned heading above a 2-to-3 column grid of clickable image tiles where the first tile is a tall 3:4 feature spanning two rows and the rest are 4:3, each under a bottom-up foreground gradient with the collection name and product count overlaid. Tiles route through useNavigate; imagery is alt-driven. Use to merchandise curated edits (Work From Home, Audio & Sound, Gaming Gear, etc.) on electronics stores, gadget shops, or consumer-tech retailers.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Collection tiles (first is the tall feature). */
    items: z
      .array(
        z.object({
          name: z.string(),
          count: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Featured Collections'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Work From Home',
            count: '42 products',
            imageAlt:
              'Minimal workspace setup with laptop, notebook and coffee cup on white desk',
          },
          {
            name: 'Mobile Accessories',
            count: '156 products',
            imageAlt:
              'Mobile phone accessories including cases, chargers and screen protectors',
          },
          {
            name: 'Audio & Sound',
            count: '89 products',
            imageAlt: 'Portable bluetooth speakers in various colors and sizes',
          },
          {
            name: 'Drones & Cameras',
            count: '64 products',
            imageAlt:
              'Aerial view of drone flying over landscape with mountains',
          },
          {
            name: 'Gaming Gear',
            count: '127 products',
            imageAlt: 'Gaming laptop with RGB keyboard and gaming peripherals',
          },
        ]

    return (
      <section className={cn('bg-muted/40 py-16 lg:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-semibold text-foreground">
            {heading}
          </h2>
          <ResponsiveGrid cols="2-lg-3" gap="sm">
            {items.map((g, i) => (
              <button
                key={g.name}
                type="button"
                onClick={() => go(g.name)}
                className={cn(
                  'group relative overflow-hidden rounded-xl bg-muted text-left',
                  i === 0 ? 'aspect-[3/4] lg:row-span-2' : 'aspect-[4/3]',
                )}
              >
                <Image
                  alt={g.imageAlt}
                  w={600}
                  h={i === 0 ? 800 : 450}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent"
                />
                <div className="absolute bottom-4 left-4 text-background sm:bottom-6 sm:left-6">
                  <h3 className="mb-1 text-lg font-semibold sm:text-xl">
                    {g.name}
                  </h3>
                  <p className="text-xs text-background/80 sm:text-sm">
                    {g.count}
                  </p>
                </div>
              </button>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
