import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardActions,
  ProductCardContent,
} from '#/section-kit/ProductCard.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  commerceProduct,
  useCommerceFilteredProducts,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * BeautyStoreProducts — editorial-vogue shoppable bestsellers grid for a beauty /
 * skincare / cosmetics e-commerce landing page. A hairline-underlined masthead row:
 * mono index rail ("N° 02" — rule — eyebrow) and a serif italic heading on the left
 * with an uppercase mono "view all" link on the right. Below, a staggered 2-to-4
 * column grid of sharp-edged product plates — every even plate drops on a lower
 * baseline — each with an alt-driven square product photo zooming slowly on hover,
 * an optional hairline mono status chip (Bestseller in primary, Clean / New in
 * foreground), a floating sharp add-to-cart button appearing on hover, mono
 * uppercase brand name, product title, star rating strip + review count under a
 * hairline rule, and a serif price. Add-to-cart writes to the shared Lakebed cart;
 * view-all routes through section-kit route links. Use on beauty store homepages,
 * product showcase sections, skincare shop grids, makeup bestsellers, or any
 * e-commerce product listing. Renders fully with no props via 8 clean-beauty
 * baked-in defaults.
 */
export const BeautyStoreProducts = defineCapsule({
  name: 'BeautyStoreProducts',
  description:
    "Editorial-vogue shoppable bestsellers grid for a beauty / skincare / cosmetics e-commerce landing page: a hairline-underlined masthead row with a mono index rail and serif italic heading on the left and an uppercase mono 'view all' link on the right, above a staggered 2-to-4-column grid of sharp-edged product plates where every even plate drops to a lower baseline. Each plate has an alt-driven square product photo that zooms slowly on hover, an optional hairline mono status chip (Bestseller / Clean / New), a floating sharp add-to-cart button that appears on hover and writes to the shared Lakebed cart, mono uppercase brand name, product title, star rating strip + review count under a hairline rule, and a serif price. Use on beauty store homepages, skincare shop grids, makeup bestsellers, or any e-commerce product listing.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** "View all" link label. */
    viewAll: z.string().optional(),
    /** Product items to display. */
    items: z
      .array(
        z.object({
          brand: z.string(),
          title: z.string(),
          price: z.string(),
          reviews: z.string(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Most Loved'
    const heading = props.heading ?? 'Bestsellers'
    const viewAll = props.viewAll ?? 'View All Products'
    const items = props.items?.length
      ? props.items
      : [
          {
            brand: 'The Ordinary',
            title: 'Hyaluronic Acid 2% + B5 Hydrating Serum',
            price: '$8.90',
            reviews: '(2,847)',
            badge: 'Bestseller',
          },
          {
            brand: 'Glow Recipe',
            title: 'Watermelon Glow Sleeping Mask',
            price: '$45.00',
            reviews: '(1,932)',
            badge: 'Clean',
          },
          {
            brand: 'Laneige',
            title: 'BB Cushion Foundation SPF 50',
            price: '$39.00',
            reviews: '(4,156)',
            badge: 'New',
          },
          {
            brand: 'Rare Beauty',
            title: 'Soft Pinch Liquid Blush - Hope',
            price: '$23.00',
            reviews: '(8,421)',
          },
          {
            brand: 'CeraVe',
            title: 'Moisturizing Cream with Ceramides',
            price: '$16.99',
            reviews: '(15,203)',
            badge: 'Bestseller',
          },
          {
            brand: 'Fenty Beauty',
            title: 'Gloss Bomb Universal Lip Luminizer',
            price: '$21.00',
            reviews: '(6,789)',
          },
          {
            brand: 'Drunk Elephant',
            title: 'Protini Polypeptide Cream',
            price: '$68.00',
            reviews: '(3,245)',
            badge: 'Clean',
          },
          {
            brand: 'Charlotte Tilbury',
            title: 'Airbrush Flawless Finish Setting Powder',
            price: '$45.00',
            reviews: '(2,156)',
            badge: 'New',
          },
        ]
    useSyncCommerceCatalog(
      lakebed,
      items.map((product) =>
        commerceProduct({
          imageAlt: `${product.brand} ${product.title} product photo`,
          label: product.title,
          price: product.price,
          subtitle: product.brand,
        }),
      ),
    )
    const visibleItems = useCommerceFilteredProducts(
      lakebed,
      items,
      (product) => [product.brand, product.title, product.price, product.badge],
    )

    const PlusIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const badgeClass = (badge: string) =>
      badge === 'Bestseller' ? 'text-primary' : 'text-foreground'

    return (
      <section
        className={cn(
          'bg-muted/40 py-16 pb-24 sm:py-20 lg:py-24 lg:pb-36',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 border-b border-border pb-6 sm:mb-14">
            {/* Mono index rail above the masthead row. */}
            <div className="mb-5 flex items-center gap-4">
              <MonoTag className="shrink-0 text-foreground">N° 02</MonoTag>
              <span
                aria-hidden="true"
                className="h-px w-10 bg-border sm:max-w-24 sm:flex-1"
              />
              <MonoTag tone="primary" className="min-w-0">
                {eyebrow}
              </MonoTag>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="font-serif text-4xl font-medium italic tracking-tight text-foreground sm:text-5xl"
              />
              <NavbarRouteLink
                className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:text-primary"
                href={viewAll}
              >
                {viewAll}
                <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-1" />
              </NavbarRouteLink>
            </div>
          </div>

          <ResponsiveGrid
            cols="2-lg-4"
            className="gap-4 sm:gap-6 lg:gap-8 [&>*:nth-child(even)]:translate-y-6 lg:[&>*:nth-child(even)]:translate-y-12"
          >
            {visibleItems.map((product) => (
              <ProductCard
                key={product.title}
                variant="elevated"
                className="rounded-none border border-border shadow-none transition-colors duration-150 hover:border-foreground/40"
              >
                <ProductCardImage className="rounded-none">
                  <Image
                    alt={`${product.brand} ${product.title} product photo`}
                    w={600}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  {product.badge ? (
                    <ProductCardBadge
                      className={cn(
                        'rounded-none border border-foreground/20 bg-background/90 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm',
                        badgeClass(product.badge),
                      )}
                    >
                      {product.badge}
                    </ProductCardBadge>
                  ) : null}
                  <ProductCardActions>
                    <CommerceAddItemButton
                      lakebed={lakebed}
                      item={{
                        label: product.title,
                        price: product.price,
                      }}
                      aria-label={`Add ${product.title} to cart`}
                      className="flex size-10 items-center justify-center rounded-none border border-foreground/20 bg-background/90 text-foreground opacity-0 backdrop-blur-sm transition-opacity hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70 group-hover:opacity-100"
                    >
                      <PlusIcon />
                    </CommerceAddItemButton>
                  </ProductCardActions>
                </ProductCardImage>
                <ProductCardContent className="p-4 sm:p-5">
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {product.brand}
                  </p>
                  <h3 className="mb-3 line-clamp-2 text-sm font-medium leading-snug text-card-foreground sm:text-base">
                    {product.title}
                  </h3>
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={5}
                        size="sm"
                        color="primary"
                        className="[&_svg]:size-3"
                      />
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {product.reviews}
                      </span>
                    </div>
                    <p className="font-serif text-lg font-medium text-card-foreground">
                      {product.price}
                    </p>
                  </div>
                </ProductCardContent>
              </ProductCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
