import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * JewelryStoreCollections — curated collections grid for a luxury jewelry
 * boutique. A centered eyebrow + serif heading + description introduce a
 * responsive grid (1/2/3 cols) of clickable collection cards: each a tall
 * 4:5 image that zooms on hover, a wide letter-spaced gold tag, a serif
 * title, and a muted meta line (count • from price). Every card routes
 * through useNavigate. Use to showcase distinct jewelry collections (Bridal,
 * Daily Luxury, Statement, Heritage) for fine jewelers, diamond houses, or
 * engagement-ring boutiques. Renders fully with no props via baked-in defaults.
 */
export const JewelryStoreCollections = defineCapsule({
  name: 'JewelryStoreCollections',
  description:
    'Curated collections grid for a luxury jewelry boutique: a centered gold eyebrow + serif heading + description introduce a responsive grid (1/2/3 cols) of clickable collection cards, each a tall 4:5 image that zooms on hover, a wide letter-spaced gold tag, a serif title, and a muted meta line (piece count • from price). Every card routes through useNavigate. Use to showcase distinct jewelry collections (Bridal, Daily Luxury, Statement, Heritage) for fine jewelers, diamond houses, or engagement-ring boutiques.',
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
    const go = useNavigate()
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
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="mx-auto mb-20 max-w-2xl text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-primary">
              {eyebrow}
            </p>
            <h2 className="mb-6 font-serif text-4xl text-foreground lg:text-5xl">
              {heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <button
                key={c.title}
                type="button"
                onClick={() => go(c.title)}
                className="group block w-full cursor-pointer text-left"
              >
                <div className="mb-6 aspect-[4/5] overflow-hidden bg-muted">
                  <Image
                    alt={c.imageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary">
                  {c.tag}
                </p>
                <h3 className="mb-2 font-serif text-2xl text-foreground">
                  {c.title}
                </h3>
                <p className="text-sm text-muted-foreground">{c.meta}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
