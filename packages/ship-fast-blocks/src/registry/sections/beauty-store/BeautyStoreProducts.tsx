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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * BeautyStoreProducts — shoppable bestsellers product grid for a beauty / skincare /
 * cosmetics e-commerce landing page. A section eyebrow + heading on the left with a
 * "view all" link on the right, above a responsive 2-to-4-column grid of product
 * cards. Each card has an alt-driven square product photo zooming on hover, an
 * optional status badge (Bestseller / Clean / New mapped to primary / secondary /
 * accent), a floating add-to-cart button that appears on hover, the brand name,
 * product title, star rating strip + review count, and price. Add-to-cart writes
 * to the shared Lakebed cart; view-all routes through section-kit route links. Use on beauty store homepages, product showcase
 * sections, skincare shop grids, makeup bestsellers, or any e-commerce product
 * listing. Renders fully with no props via 8 clean-beauty baked-in defaults.
 */
export const BeautyStoreProducts = defineCapsule({
  name: 'BeautyStoreProducts',
  description:
    "Shoppable bestsellers product grid for a beauty / skincare / cosmetics e-commerce landing page: a section eyebrow and heading on the left with a 'view all' link on the right, above a responsive 2-to-4-column grid of product cards. Each card has an alt-driven square product photo that zooms on hover, an optional status badge (Bestseller / Clean / New), a floating add-to-cart button that appears on hover and writes to the shared Lakebed cart, brand name, product title, star rating strip + review count, and price. Use on beauty store homepages, skincare shop grids, makeup bestsellers, or any e-commerce product listing.",
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

    const badgeClass = (badge: string) => {
      if (badge === 'Clean') return 'bg-secondary text-secondary-foreground'
      if (badge === 'New') return 'bg-accent text-accent-foreground'
      return 'bg-primary text-primary-foreground'
    }

    return (
      <section className={cn('bg-muted/40 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              className="gap-0"
              eyebrowClassName="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary"
              titleClassName="font-serif text-3xl font-semibold text-foreground sm:text-4xl"
            />
            <NavbarRouteLink
              className="flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight className="size-4" />
            </NavbarRouteLink>
          </div>

          <ResponsiveGrid cols="2-lg-4" className="sm:gap-6 lg:gap-8 gap-4">
            {visibleItems.map((product) => (
              <ProductCard
                key={product.title}
                variant="elevated"
                className="shadow-sm transition-shadow hover:shadow-lg"
              >
                <ProductCardImage>
                  <Image
                    alt={`${product.brand} ${product.title} product photo`}
                    w={600}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge ? (
                    <ProductCardBadge
                      className={cn(
                        'rounded-full font-semibold',
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
                      className="flex size-10 items-center justify-center rounded-full bg-card text-card-foreground opacity-0 shadow-md transition-opacity hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-70 group-hover:opacity-100"
                    >
                      <PlusIcon />
                    </CommerceAddItemButton>
                  </ProductCardActions>
                </ProductCardImage>
                <ProductCardContent className="p-4">
                  <p className="mb-1 text-xs text-muted-foreground">
                    {product.brand}
                  </p>
                  <h3 className="mb-2 line-clamp-2 font-medium text-card-foreground">
                    {product.title}
                  </h3>
                  <div className="mb-3 flex items-center gap-2">
                    <StarRating
                      rating={5}
                      size="sm"
                      color="primary"
                      className="[&_svg]:size-3"
                    />
                    <span className="text-xs text-muted-foreground">
                      {product.reviews}
                    </span>
                  </div>
                  <p className="font-semibold text-card-foreground">
                    {product.price}
                  </p>
                </ProductCardContent>
              </ProductCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
