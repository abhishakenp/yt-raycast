import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardTitle,
  ProductCardPrice,
} from '#/section-kit/ProductCard.tsx'
import {
  PiecesGrid,
  PiecesCard,
  PieceSpecs,
} from '#/section-kit/PiecesGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useCommerceFilteredProducts,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * JewelryStorePieces — featured-pieces vitrine cabinet for a luxury jewelry
 * maison. A header row pairs a mono micro-label kicker + serif heading with a
 * right-aligned underlined mono "View All" link, above a collapsed-border grid
 * (2 cols mobile, 4 desktop, gap-0) whose shared hairlines read like the
 * compartments of a glass display case. Each cell holds a clickable square
 * image/title that routes to the piece, an optional square corner badge (New =
 * primary, others = an inverted foreground chip), a serif title, a mono spec
 * line, a tabular price, and a hairline Lakebed add-to-cart button that fills on
 * hover. The View All link routes through section-kit route links. Use to
 * merchandise individual pieces (rings, necklaces, earrings, bracelets) for fine
 * jewelers, diamond houses, or watch maisons. Renders fully with no props.
 */
export const JewelryStorePieces = defineCapsule({
  name: 'JewelryStorePieces',
  description:
    'Featured-pieces vitrine cabinet for a luxury jewelry maison: a header row pairing a mono micro-label kicker + serif heading with a right-aligned underlined mono View All link, above a collapsed-border grid (2 cols mobile, 4 desktop, gap-0) whose shared hairlines read like the compartments of a glass display case. Each cell holds a clickable square image/title that routes to the piece, an optional square corner badge (New = primary, others = an inverted foreground chip), a serif title, a mono spec line, a tabular price, and a hairline Lakebed add-to-cart button that fills on hover and updates the shared cart. The View All link routes through section-kit route links. Use to merchandise individual pieces (rings, necklaces, earrings, bracelets) for fine jewelers, diamond houses, or watch maisons.',
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
    const visibleItems = useCommerceFilteredProducts(
      lakebed,
      items,
      (piece) => [
        piece.title,
        piece.spec,
        piece.price,
        piece.badge,
        piece.imageAlt,
      ],
    )

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl" className="sm:px-4">
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              className="gap-0"
              eyebrowClassName="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
              titleClassName="font-serif text-4xl font-normal tracking-tight text-foreground lg:text-5xl"
            />
            <NavbarRouteLink
              className="inline-flex w-fit items-center border-b border-foreground pb-1 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-muted-foreground hover:text-muted-foreground"
              href={viewAll}
            >
              {viewAll}
            </NavbarRouteLink>
          </div>
          <PiecesGrid className="grid grid-cols-2 gap-0 border-l border-t border-border lg:grid-cols-4">
            {visibleItems.map((p) => (
              <PiecesCard asChild key={p.title}>
                <ProductCard
                  variant="none"
                  className="w-full rounded-none border-0 border-b border-r border-border bg-background p-5 text-left"
                >
                  <NavbarRouteLink
                    className="block w-full text-left"
                    href={p.title}
                  >
                    <ProductCardImage className="mb-5 aspect-square bg-muted">
                      <Image
                        alt={p.imageAlt}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {p.badge ? (
                        <ProductCardBadge
                          className={cn(
                            'left-0 top-0 rounded-none px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em]',
                            p.badge === 'New'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-foreground text-background',
                          )}
                        >
                          {p.badge}
                        </ProductCardBadge>
                      ) : null}
                    </ProductCardImage>
                    <ProductCardTitle className="mb-1.5 font-serif text-lg font-normal text-foreground">
                      {p.title}
                    </ProductCardTitle>
                  </NavbarRouteLink>
                  <PieceSpecs className="mb-2 mt-0 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {p.spec}
                  </PieceSpecs>
                  <ProductCardPrice className="text-foreground tabular-nums">
                    {p.price}
                  </ProductCardPrice>
                  <CommerceAddItemButton
                    lakebed={lakebed}
                    item={{ label: p.title, price: p.price }}
                    pendingChildren={
                      <>
                        <CommerceMutationSpinner />
                        Adding
                      </>
                    }
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-none border border-border px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground transition-[background-color,border-color,color,transform] duration-150 hover:border-foreground hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                  >
                    {addToCartLabel}
                  </CommerceAddItemButton>
                </ProductCard>
              </PiecesCard>
            ))}
          </PiecesGrid>
        </Container>
      </section>
    )
  },
})
