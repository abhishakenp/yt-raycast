import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  ProductCard,
  ProductCardImage,
  ProductCardContent,
  ProductCardTitle,
} from '#/section-kit/ProductCard.tsx'
import { ShopGrid, ShopCard } from '#/section-kit/ShopGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
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
 * IllustratorShop — a hand-made art-print shop for an illustrator / visual-artist
 * portfolio. An asymmetric header pairs a mono index micro-label + serif heading
 * + paragraph on the left with a mono "print shop" tag on the right, above a
 * responsive 4-up grid of product cards drawn as sketchbook frames (rounded-none
 * dashed borders, hard offset shadows, staggered vertical rhythm); each card has
 * a square image that zooms on hover, a serif title, a mono meta line, and a
 * price beside a rounded-full sticker "add to cart" button that presses flat.
 * A sticker "visit full shop" CTA sits beneath. Add-to-cart writes to the shared
 * commerce Lakebed cart/catalog while the shop CTA routes through route links.
 * Use to sell limited-edition prints, greeting cards, and illustrated goods.
 * Renders fully with no props via baked-in defaults.
 */
export const IllustratorShop = defineCapsule({
  name: 'IllustratorShop',
  description:
    "Hand-made art-print shop for an illustrator / visual-artist portfolio: an asymmetric header pairing a mono index micro-label + serif heading + paragraph with a mono 'print shop' tag, above a responsive 4-up grid of product cards drawn as sketchbook frames (rounded-none dashed borders, hard offset shadows, staggered vertical rhythm), each with a square image that zooms on hover, a serif title, a mono meta line, and a price beside a rounded-full sticker 'add to cart' button that presses flat, plus a sticker 'visit full shop' CTA beneath. Add-to-cart writes to the shared commerce Lakebed cart/catalog while the shop CTA routes through route links. Use to sell limited-edition prints, greeting cards, and illustrated goods.",
  lakebed: commerceCartLakebed,
  props: z.object({
    /** Uppercase accent eyebrow label. */
    eyebrow: z.string().optional(),
    /** Serif section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Outlined CTA label beneath the grid. */
    cta: z.string().optional(),
    /** Per-card add-to-cart button label. */
    addToCart: z.string().optional(),
    /** Product cards. */
    items: z
      .array(
        z.object({
          title: z.string(),
          meta: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Art Shop'
    const heading = props.heading ?? 'Prints & Products'
    const description =
      props.description ??
      'Limited edition prints, greeting cards, and illustrated goods shipped worldwide from my Portland studio.'
    const cta = props.cta ?? 'Visit Full Shop'
    const addToCart = props.addToCart ?? 'Add to Cart'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Golden Hour Mountains',
            meta: 'Giclée print · 11"×14"',
            price: '$48',
          },
          {
            title: 'Botanical Dreams',
            meta: 'Giclée print · 8"×10"',
            price: '$32',
          },
          {
            title: 'Cozy Reading Corner',
            meta: 'Giclée print · 11"×14"',
            price: '$48',
          },
          {
            title: 'Seasonal Card Set',
            meta: '8 cards + envelopes',
            price: '$24',
          },
        ]
    useSyncCommerceCatalog(
      lakebed,
      items.map((item) =>
        commerceProduct({
          imageAlt: item.title,
          label: item.title,
          price: item.price,
          subtitle: item.meta,
        }),
      ),
    )
    const visibleItems = useCommerceFilteredProducts(lakebed, items, (item) => [
      item.title,
      item.meta,
      item.price,
    ])

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section
        className={cn(
          'bg-background px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-12 flex flex-col justify-between gap-6 border-b-2 border-dashed border-border pb-8 sm:mb-16 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="mb-4 font-serif text-3xl sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag className="shrink-0 self-start text-muted-foreground/70 sm:self-end">
              [ print shop ]
            </MonoTag>
          </div>
          <ShopGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visibleItems.map((item, i) => (
              <ShopCard asChild key={item.title}>
                <ProductCard
                  variant="outlined"
                  className={cn(
                    'rounded-none border-2 border-dashed border-foreground/50 transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:border-foreground hover:shadow-[6px_6px_0_0_var(--color-foreground)]',
                    i % 2 === 1 && 'lg:translate-y-6',
                  )}
                >
                  <ProductCardImage className="border-b-2 border-dashed border-foreground/40">
                    <Image
                      alt={item.title}
                      w={500}
                      h={500}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </ProductCardImage>
                  <ProductCardContent>
                    <ProductCardTitle className="mb-1 font-serif text-lg text-card-foreground">
                      {item.title}
                    </ProductCardTitle>
                    <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {item.meta}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold tabular-nums text-card-foreground">
                        {item.price}
                      </span>
                      <CommerceAddItemButton
                        lakebed={lakebed}
                        item={{
                          label: item.title,
                          price: item.price,
                        }}
                        aria-label={`${addToCart} ${item.title}`}
                        pendingChildren={
                          <>
                            <CommerceMutationSpinner />
                            Adding
                          </>
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-[3px_3px_0_0_var(--color-primary)] transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-primary)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                      >
                        {addToCart}
                      </CommerceAddItemButton>
                    </div>
                  </ProductCardContent>
                </ProductCard>
              </ShopCard>
            ))}
          </ShopGrid>
          <div className="mt-14 text-center">
            <NavbarRouteLink
              className="inline-flex -rotate-1 items-center gap-2 rounded-full border-2 border-dashed border-foreground px-8 py-4 text-sm font-medium text-foreground shadow-[4px_4px_0_0_var(--color-foreground)] transition-[transform,box-shadow,color,background-color] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-foreground hover:text-background hover:shadow-[6px_6px_0_0_var(--color-primary)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              href={cta}
            >
              {cta}
              <ArrowRight className="size-4" />
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
