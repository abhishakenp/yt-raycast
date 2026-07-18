import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ElectronicsStoreGallery — a "Featured Collections" masonry gallery on a muted
 * band for an electronics storefront. A left-aligned heading above a 2-to-3
 * column grid of clickable image tiles where the first tile is a tall 3:4 feature
 * spanning two rows and the rest are 4:3, each under a bottom-up foreground
 * gradient with the collection name and product count overlaid. Tiles route
 * through useNavigate. Use to merchandise curated edits on electronics or gadget
 * storefronts.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
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
        <Container>
          <h2 className="mb-8 text-2xl font-semibold text-foreground">
            {heading}
          </h2>
          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {items
                .map((item) => ({
                  alt: item.imageAlt,
                  caption: item.name,
                }))
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
