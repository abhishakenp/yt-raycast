import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { ImageTile } from '#/section-kit/ImageTile.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  CollectionGrid,
  CollectionCard,
} from '#/section-kit/CollectionGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * JewelryStoreCollections — curated collections catalog for a luxury jewelry
 * maison. An asymmetric header pairs a mono micro-label kicker + serif heading +
 * description with a right-aligned mono collection count, over a giant ghost
 * serif watermark, above a staggered 1/2/3 grid of collection plates broken into
 * an editorial rhythm — each a tall 4:5 photograph set in a hairline vitrine mat
 * that zooms gently on hover, followed by a museum-label caption (mono index
 * numeral + tag, serif title, mono meta line). Every plate routes through
 * section-kit route links. Use to showcase distinct jewelry collections (Bridal,
 * Daily Luxury, Statement, Heritage) for fine jewelers, diamond houses, or
 * engagement-ring boutiques. Renders fully with no props via baked-in defaults.
 */
export const JewelryStoreCollections = defineCapsule({
  name: 'JewelryStoreCollections',
  description:
    'Curated collections catalog for a luxury jewelry maison: an asymmetric header pairing a mono micro-label kicker + serif heading + description with a right-aligned mono collection count, over a giant ghost serif watermark, above a staggered 1/2/3 grid of collection plates broken into an editorial rhythm — each a tall 4:5 photograph set in a hairline vitrine mat that zooms gently on hover, followed by a museum-label caption (mono index numeral + tag, serif title, mono meta line). Every plate routes through section-kit route links. Use to showcase distinct jewelry collections (Bridal, Daily Luxury, Statement, Heritage) for fine jewelers, diamond houses, or engagement-ring boutiques.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          tag: z.string(),
          title: z.string(),
          meta: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Curated Collections'
    const heading = props.heading ?? 'Extraordinary by Design'
    const description =
      props.description ??
      'Each collection represents a distinct vision of elegance, crafted for those who appreciate the exceptional.'
    const items = props.items?.length
      ? props.items
      : [
          {
            tag: 'Bridal',
            title: 'Éternelle Engagement',
            meta: '18 pieces • From $3,200',
            imageAlt:
              'solitaire diamond engagement ring with platinum band on black velvet',
          },
          {
            tag: 'Daily Luxury',
            title: 'Lumière Essentials',
            meta: '24 pieces • From $850',
            imageAlt:
              'delicate gold chain necklace with small diamond pendant on marble surface',
          },
          {
            tag: 'Statement',
            title: 'Grand Gala',
            meta: '12 pieces • From $8,500',
            imageAlt: 'statement sapphire and diamond cocktail ring on hand',
          },
          {
            tag: 'Heritage',
            title: 'Archive Revival',
            meta: '16 pieces • From $4,800',
            imageAlt: 'vintage-inspired pearl drop earrings with gold filigree',
          },
          {
            tag: 'Icons',
            title: 'Maison Classics',
            meta: '20 pieces • From $5,200',
            imageAlt: 'emerald cut diamond tennis bracelet on wrist',
          },
          {
            tag: 'Masculine',
            title: "Gentleman's Edit",
            meta: '14 pieces • From $1,200',
            imageAlt: 'mens signet ring with black onyx stone in yellow gold',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-16 font-serif text-[22vw] font-normal tracking-tighter">
          Éclat
        </Watermark>
        <Container className="relative px-6 lg:px-12 xl:px-20">
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              align="left"
              className="max-w-xl gap-4"
              eyebrowClassName="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
              titleClassName="font-serif text-4xl font-normal tracking-tight text-foreground lg:text-5xl"
              subtitleClassName="max-w-md text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums"
            >
              {String(items.length).padStart(2, '0')} Collections
            </p>
          </div>
          <CollectionGrid
            cols="1-2-3"
            className="gap-x-6 gap-y-14 lg:[&>*:nth-child(3n-1)]:translate-y-16"
          >
            {items.map((c, i) => (
              <CollectionCard asChild key={c.title}>
                <NavbarRouteLink
                  className="group block w-full cursor-pointer text-left"
                  href={c.title}
                >
                  <ImageTile
                    treatment="4-5-lg-muted"
                    className="mb-5 rounded-none border border-border p-2"
                  >
                    <Image
                      alt={c.imageAlt}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </ImageTile>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      {c.tag}
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl font-normal text-foreground">
                    {c.title}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {c.meta}
                  </p>
                </NavbarRouteLink>
              </CollectionCard>
            ))}
          </CollectionGrid>
        </Container>
      </section>
    )
  },
})
