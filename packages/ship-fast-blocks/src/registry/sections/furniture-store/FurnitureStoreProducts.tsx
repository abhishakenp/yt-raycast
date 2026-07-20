import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
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
 * FurnitureStoreProducts — an editorial-catalog best-sellers product grid. An
 * asymmetric header row (mono index eyebrow + heading left, arrow "shop all"
 * link right) above a responsive 1/2/4-column grid of column-staggered product
 * plates; each plate has a square rounded-none image that zooms on hover, an
 * optional square corner badge (Sale tinted destructive, otherwise primary), a
 * hover-revealed square add-to-cart button, and a museum-label caption block
 * (mono index numeral + product name link, mono variant subtitle, and a
 * tabular-num price line that shows a struck-through original price when on
 * sale). Card links and view-all route through section-kit route links;
 * add-to-cart writes to the shared Lakebed cart. Use as the product / shop grid
 * for furniture, home-decor, or any retail store. Renders fully with no props
 * via baked-in "Haven & Home" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const FurnitureStoreProducts = defineCapsule({
  name: 'FurnitureStoreProducts',
  description:
    "Editorial-catalog best-sellers product grid: an asymmetric header row (mono index eyebrow + heading left, arrow 'shop all' link right) above a responsive 1/2/4-column grid of column-staggered product plates; each plate has a square rounded-none image that zooms on hover, an optional square corner badge (Sale tinted destructive, else primary), a hover-revealed square add-to-cart button that writes to the shared Lakebed cart, and a museum-label caption (mono index numeral + product name link, mono variant subtitle, and a tabular-num price line showing a struck-through original price when on sale). Card links and view-all route through section-kit route links. Use as the product / shop grid for furniture, home-decor, or any retail store.",
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
          <div className="mb-12 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={heading}
                titleId="furniture-bestsellers-heading"
                className="gap-0"
                eyebrowClassName="mb-3 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
                titleClassName="text-3xl font-medium tracking-tight lg:text-4xl"
              />
            </div>
            <NavbarRouteLink
              className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:text-muted-foreground"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight className="ml-1.5 size-4" />
            </NavbarRouteLink>
          </div>

          <ResponsiveGrid cols="1-2-4" className="items-start gap-x-6 gap-y-12">
            {visibleItems.map((product, i) => (
              <ProductCard
                key={product.name}
                variant="none"
                className={cn(i % 2 === 1 && 'lg:mt-12')}
              >
                <ProductCardImage className="mb-4 rounded-none">
                  <NavbarRouteLink
                    className="block size-full"
                    aria-label={product.name}
                    href={product.name}
                  >
                    <Image
                      alt={`${product.name}, ${product.variant}`}
                      w={500}
                      h={500}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </NavbarRouteLink>
                  {product.badge ? (
                    <ProductCardBadge
                      className={cn(
                        'rounded-none font-mono text-[10px] uppercase tracking-[0.12em]',
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
                      className="grid size-10 place-items-center rounded-none border border-border bg-card p-2 opacity-0 transition-[opacity,transform] duration-150 hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-70 group-hover:opacity-100 motion-reduce:active:scale-100"
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
                <div className="flex items-baseline gap-2">
                  <span
                    aria-hidden="true"
                    className="font-mono text-[10px] tabular-nums tracking-[0.16em] text-muted-foreground"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <ProductCardTitle asChild className="mb-0">
                    <NavbarRouteLink
                      className="text-sm transition-colors hover:text-muted-foreground"
                      href={product.name}
                    >
                      {product.name}
                    </NavbarRouteLink>
                  </ProductCardTitle>
                </div>
                <ProductCardSubtitle className="mb-2 ml-6 mt-1 font-mono text-[11px] uppercase tracking-[0.1em]">
                  {product.variant}
                </ProductCardSubtitle>
                <ProductCardPrice className="ml-6 text-sm tabular-nums">
                  {product.oldPrice ? (
                    <span className="mr-2 text-muted-foreground/70 line-through">
                      {product.oldPrice}
                    </span>
                  ) : null}
                  {product.price}
                </ProductCardPrice>
              </ProductCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
