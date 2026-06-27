import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useCommerceFilteredProducts,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * JewelryStorePieces — featured-pieces product grid for a luxury jewelry
 * boutique. A header row pairs a gold eyebrow + serif heading with a
 * right-aligned underlined "View All" link, above a responsive grid (1/2/4
 * cols) of product cards: a clickable square image/title that routes to the
 * piece, an optional status badge, a serif title, muted spec line, gold price,
 * and a Lakebed-backed add-to-cart button. The View All link routes through
 * useNavigate. Use to merchandise individual pieces (rings, necklaces,
 * earrings, bracelets) for fine jewelers, diamond houses, or watch maisons.
 * Renders fully with no props via baked-in defaults.
 */
export const JewelryStorePieces = defineCapsule({
  name: 'JewelryStorePieces',
  description:
    'Featured-pieces product grid for a luxury jewelry boutique: a header row pairing a gold eyebrow + serif heading with a right-aligned underlined View All link, above a responsive grid (1/2/4 cols) of product cards, each with a clickable square image/title that routes to the piece, an optional corner status badge (New = primary, others = secondary), a serif title, muted spec line, gold price, and a Lakebed-backed add-to-cart button that updates the shared cart. The View All link routes through useNavigate. Use to merchandise individual pieces (rings, necklaces, earrings, bracelets) for fine jewelers, diamond houses, or watch maisons.',
  lakebed: commerceCartLakebed,
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    viewAll: z.string().optional(),
    addToCartLabel: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          spec: z.string(),
          price: z.string(),
          imageAlt: z.string(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Current Selection'
    const heading = props.heading ?? 'Featured Pieces'
    const viewAll = props.viewAll ?? 'View All Jewelry'
    const addToCartLabel = props.addToCartLabel ?? 'Add to cart'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Solitaire Eternity Ring',
            spec: 'Platinum, 2.1ct D-VVS1',
            price: '$18,500',
            badge: 'New',
            imageAlt:
              'round brilliant cut diamond solitaire ring in platinum setting',
          },
          {
            title: 'Pendant Lumière',
            spec: '18K Yellow Gold, 0.5ct',
            price: '$3,200',
            imageAlt: 'gold chain necklace with small round diamond pendant',
          },
          {
            title: 'Halo Stud Earrings',
            spec: 'White Gold, 1.4ctw',
            price: '$7,800',
            badge: 'Bestseller',
            imageAlt: 'halo diamond stud earrings with milgrain detailing',
          },
          {
            title: 'Tennis Classic Bracelet',
            spec: 'White Gold, 5.0ctw',
            price: '$22,000',
            imageAlt:
              'tennis bracelet with round diamonds in white gold setting',
          },
          {
            title: 'Pearl Cascade Drops',
            spec: '18K Gold, South Sea Pearls',
            price: '$4,500',
            imageAlt: 'pearl drop earrings with diamond accents in yellow gold',
          },
          {
            title: 'Onyx Signet Cufflinks',
            spec: 'Sterling Silver, Onyx',
            price: '$1,450',
            imageAlt:
              "men's cufflinks with mother of pearl inlay in white gold",
          },
          {
            title: 'Art Deco Sapphire Ring',
            spec: 'Platinum, Ceylon Sapphire',
            price: '$32,500',
            badge: 'Limited',
            imageAlt: 'sapphire and diamond cocktail ring with art deco design',
          },
          {
            title: 'Baguette Eternity Band',
            spec: 'White Gold, 2.8ctw',
            price: '$12,800',
            imageAlt: 'eternity band ring with channel-set baguette diamonds',
          },
        ]
    useSyncCommerceCatalog(
      lakebed,
      items.map((piece) =>
        commerceProduct({
          imageAlt: piece.imageAlt,
          label: piece.title,
          price: piece.price,
          subtitle: piece.spec,
        }),
      ),
    )
    const visibleItems = useCommerceFilteredProducts(lakebed, items, (piece) => [
      piece.title,
      piece.spec,
      piece.price,
      piece.badge,
      piece.imageAlt,
    ])

    return (
      <section className={cn('bg-background py-32', props.className)}>
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.3em] text-primary">
                {eyebrow}
              </p>
              <h2 className="font-serif text-4xl text-foreground lg:text-5xl">
                {heading}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="mt-6 inline-block w-fit border-b border-primary pb-0.5 text-sm uppercase tracking-widest text-primary lg:mt-0"
            >
              {viewAll}
            </button>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {visibleItems.map((p) => (
              <article key={p.title} className="group block w-full text-left">
                <button
                  type="button"
                  onClick={() => go(p.title)}
                  className="block w-full text-left"
                >
                  <div className="relative mb-5 aspect-square overflow-hidden bg-muted">
                    <Image
                      alt={p.imageAlt}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {p.badge ? (
                      <span
                        className={cn(
                          'absolute left-4 top-4 px-3 py-1 text-xs uppercase tracking-widest',
                          p.badge === 'New'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground',
                        )}
                      >
                        {p.badge}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mb-1 font-serif text-lg text-foreground">
                    {p.title}
                  </h3>
                </button>
                <p className="mb-2 text-sm text-muted-foreground">{p.spec}</p>
                <p className="text-primary">{p.price}</p>
                <CommerceAddItemButton
                  lakebed={lakebed}
                  item={{ label: p.title, price: p.price }}
                  pendingChildren={
                    <>
                      <CommerceMutationSpinner />
                      Adding
                    </>
                  }
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-primary px-4 py-2.5 text-xs uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-70"
                >
                  {addToCartLabel}
                </CommerceAddItemButton>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
