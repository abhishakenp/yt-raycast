import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardActions,
  ProductCardTitle,
  ProductCardSubtitle,
  ProductCardPrice,
} from '#/section-kit/ProductCard.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  commerceProduct,
  useCommerceFilteredProducts,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * FurnitureStoreProducts — a best-sellers product grid. A header row (eyebrow +
 * heading left, arrow "shop all" link right) above a responsive 1/2/4-column grid
 * of product cards; each card has a square image that zooms on hover, an optional
 * corner badge (Sale tinted destructive, otherwise primary), a hover-revealed
 * add-to-cart button, a product name link, a variant subtitle, and a price line
 * that shows a struck-through original price when on sale. Card links and view-all
 * route through useNavigate; add-to-cart writes to the shared Lakebed cart. Use as
 * the product / shop grid for furniture, home-decor, or any retail store. Renders
 * fully with no props via baked-in "Haven & Home" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const FurnitureStoreProducts = defineCapsule({
  name: 'FurnitureStoreProducts',
  description:
    "Best-sellers product grid: a header row (eyebrow + heading left, arrow 'shop all' link right) above a responsive 1/2/4-column grid of product cards; each card has a square image that zooms on hover, an optional corner badge (Sale tinted destructive, else primary), a hover-revealed add-to-cart button that writes to the shared Lakebed cart, a product name link, a variant subtitle, and a price line showing a struck-through original price when on sale. Card links and view-all route through useNavigate. Use as the product / shop grid for furniture, home-decor, or any retail store.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    viewAll: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          variant: z.string(),
          price: z.string(),
          /** Original price shown struck-through when on sale. */
          oldPrice: z.string().optional(),
          /** Corner badge: Bestseller / Sale / New. */
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Best Sellers'
    const heading = props.heading ?? 'Customer favorites'
    const viewAll = props.viewAll ?? 'Shop all furniture'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'The Cloud Sofa',
            variant: '3-Seater / Cream Linen',
            price: '$2,849',
            badge: 'Bestseller',
          },
          {
            name: 'Oakwood Dining Table',
            variant: 'Natural Oak / 72"',
            price: '$1,899',
          },
          {
            name: 'Velvet Accent Chair',
            variant: 'Dusty Rose / Brass Legs',
            price: '$649',
            oldPrice: '$849',
            badge: 'Sale',
          },
          {
            name: 'Walnut Bed Frame',
            variant: 'Queen / Natural Linen',
            price: '$2,299',
          },
          {
            name: 'Terrazzo Coffee Table',
            variant: 'Cream Terrazzo / Ash Base',
            price: '$749',
          },
          {
            name: 'Linen Armchair',
            variant: 'Oatmeal / Walnut Legs',
            price: '$1,249',
          },
          {
            name: 'Floating TV Console',
            variant: 'White Oak / 60"',
            price: '$899',
            badge: 'New',
          },
          {
            name: 'Rattan Pendant Light',
            variant: 'Natural Rattan / Brass',
            price: '$349',
          },
        ]
    useSyncCommerceCatalog(
      lakebed,
      items.map((product) =>
        commerceProduct({
          imageAlt: `${product.name}, ${product.variant}`,
          label: product.name,
          price: product.price,
          subtitle: product.variant,
        }),
      ),
    )
    const visibleItems = useCommerceFilteredProducts(
      lakebed,
      items,
      (product) => [
        product.name,
        product.variant,
        product.price,
        product.oldPrice,
        product.badge,
      ],
    )
    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )
    return (
      <section
        className={cn('py-16 lg:py-24', props.className)}
        aria-labelledby="furniture-bestsellers-heading"
      >
        <Container>
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <h2
                id="furniture-bestsellers-heading"
                className="text-3xl font-medium lg:text-4xl"
              >
                {heading}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
            >
              {viewAll}
              <ArrowRight className="ml-1 size-4" />
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visibleItems.map((product) => (
              <ProductCard key={product.name} variant="none">
                <ProductCardImage className="mb-4 rounded-lg">
                  <button
                    type="button"
                    onClick={() => go(product.name)}
                    className="block size-full"
                    aria-label={product.name}
                  >
                    <Image
                      alt={`${product.name}, ${product.variant}`}
                      w={500}
                      h={500}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </button>
                  {product.badge ? (
                    <ProductCardBadge
                      className={cn(
                        product.badge.toLowerCase() === 'sale'
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-primary text-primary-foreground',
                      )}
                    >
                      {product.badge}
                    </ProductCardBadge>
                  ) : null}
                  <ProductCardActions>
                    <CommerceAddItemButton
                      lakebed={lakebed}
                      item={{
                        label: product.name,
                        price: product.price,
                      }}
                      className="grid size-10 place-items-center rounded-full bg-card p-2 opacity-0 shadow transition-opacity disabled:pointer-events-none disabled:opacity-70 group-hover:opacity-100"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <svg
                        className="size-5 text-card-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </CommerceAddItemButton>
                  </ProductCardActions>
                </ProductCardImage>
                <ProductCardTitle asChild className="mb-1">
                  <button
                    type="button"
                    onClick={() => go(product.name)}
                    className="transition-colors hover:text-muted-foreground"
                  >
                    {product.name}
                  </button>
                </ProductCardTitle>
                <ProductCardSubtitle className="mb-2 mt-0">
                  {product.variant}
                </ProductCardSubtitle>
                <ProductCardPrice>
                  {product.oldPrice ? (
                    <span className="mr-2 text-muted-foreground/70 line-through">
                      {product.oldPrice}
                    </span>
                  ) : null}
                  {product.price}
                </ProductCardPrice>
              </ProductCard>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
