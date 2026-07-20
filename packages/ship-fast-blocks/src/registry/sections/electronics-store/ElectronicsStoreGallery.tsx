import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ElectronicsStoreGallery — a tech-brutalist "Featured Collections" bento gallery
 * on a muted band for an electronics storefront. A mono index eyebrow +
 * left-aligned extrabold heading above a 2-to-3 column grid of clickable image
 * tiles where the first tile is an oversized square feature spanning two columns
 * and rows and the rest are 4:3, each a squared border-2 hard-shadow plate under
 * a bottom-up foreground gradient with a mono index numeral and the collection
 * name + tabular count overlaid. Tiles route through section-kit route links. Use
 * to merchandise curated edits on electronics or gadget storefronts.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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
    'Tech-brutalist Featured Collections bento gallery on a muted band for an electronics storefront: a mono index eyebrow + left-aligned extrabold heading above a 2-to-3 column grid of clickable image tiles where the first tile is an oversized square feature spanning two columns and rows and the rest are 4:3, each a squared border-2 hard-shadow plate under a bottom-up foreground gradient with a mono index numeral and the collection name + tabular count overlaid. Tiles route through section-kit route links; imagery is alt-driven. Use to merchandise curated edits (Work From Home, Audio & Sound, Gaming Gear, etc.) on electronics stores, gadget shops, or consumer-tech retailers.',
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
          <div className="mb-10">
            <span className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <span className="tabular-nums">[ 05 ]</span>
              <span className="text-muted-foreground">Curated</span>
            </span>
            <SectionHeading
              align="left"
              title={heading}
              className="gap-0"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
            />
          </div>
          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {items
                .map((item, index) => ({
                  alt: item.imageAlt,
                  caption: item.name,
                  count: item.count,
                  index,
                }))
                .map((img) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    count?: string
                    index: number
                    title?: string
                    location?: string
                  }
                  const featured = __iv__.index === 0
                  return (
                    <GalleryTile
                      key={__iv__.alt}
                      className={cn(
                        'rounded-none border-2 border-foreground shadow-[6px_6px_0_0] shadow-foreground transition-all duration-150 hover:-translate-y-1 hover:shadow-[9px_9px_0_0] motion-reduce:transform-none',
                        featured &&
                          'sm:col-span-2 sm:row-span-2 sm:aspect-auto',
                      )}
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.16em] tabular-nums text-background/80"
                      >
                        {String(__iv__.index + 1).padStart(2, '0')}
                      </span>
                      {__iv__.caption && (
                        <GalleryTileCaption className="inset-x-0 bottom-0 border-t-2 border-background/30 bg-foreground/20 px-3 py-2 text-background backdrop-blur-sm">
                          <span
                            className={cn(
                              'block font-bold tracking-tight',
                              featured && 'sm:text-xl',
                            )}
                          >
                            {__iv__.caption}
                          </span>
                          {__iv__.count && (
                            <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums text-background/80">
                              {__iv__.count}
                            </span>
                          )}
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
