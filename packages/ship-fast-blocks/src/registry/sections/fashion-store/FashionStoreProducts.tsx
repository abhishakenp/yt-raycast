import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
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
 * FashionStoreProducts — New Arrivals product grid for a luxury fashion store.
 * A mono kicker + serif heading on the left with a right-aligned description in
 * an asymmetric intro row, above a responsive 2-to-4 column grid of sharp
 * portrait product cards, each with a hover mono Quick-Add button overlay, an
 * optional square New/Best Seller/Limited corner badge, a serif product name,
 * tabular price and mono variant label, closed by an underlined "View All"
 * link with an arrow. Every card and link routes through section-kit route
 * links and all imagery uses the alt-driven Image component. Use to showcase a
 * curated product drop for clothing brands, boutiques, or apparel shops.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardActions,
  ProductCardContent,
  ProductCardTitle,
  ProductCardPrice,
} from '#/section-kit/ProductCard.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const FashionStoreProducts = defineCapsule({
  name: 'FashionStoreProducts',
  description:
    "New Arrivals product grid for a luxury fashion store: a mono kicker + serif heading on the left with a right-aligned description in an asymmetric intro row, above a responsive 2-to-4 column grid of sharp portrait product cards, each with a hover mono Quick-Add button overlay, an optional square New/Best Seller/Limited corner badge, a serif product name, tabular price and mono variant label, closed by an underlined 'View All' link with an arrow. Every card and link routes through section-kit route links and all imagery uses the alt-driven Image component. Use to showcase a curated product drop for clothing brands, boutiques, apparel and accessories shops.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    viewAll: z.string().optional(),
    quickAdd: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          variant: z.string(),
          imageAlt: z.string(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const productsEyebrow = props.eyebrow ?? 'Just Dropped'
    const productsHeading = props.heading ?? 'New Arrivals'
    const productsDesc =
      props.description ??
      'The latest pieces from our Spring/Summer collection. Fresh silhouettes, timeless materials.'
    const productsViewAll = props.viewAll ?? 'View All New Arrivals'
    const quickAdd = props.quickAdd ?? 'Quick Add'
    const productItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Oversized Linen Blazer',
            price: '$485',
            variant: 'Cream · XS–XL',
            badge: 'New',
            imageAlt:
              "Cream-colored oversized linen blazer on minimal background, women's tailored outerwear",
          },
          {
            name: 'Structured Wool Coat',
            price: '$895',
            variant: 'Charcoal · S–XXL',
            imageAlt:
              "Structured charcoal wool coat with wide lapels, men's winter outerwear",
          },
          {
            name: 'Cashmere Blend Knit',
            price: '$295',
            variant: 'Oatmeal · XS–XL',
            badge: 'Best Seller',
            imageAlt:
              'Minimalist beige knit sweater with ribbed texture, unisex everyday essential',
          },
          {
            name: 'Wide-Leg Tailored Trousers',
            price: '$345',
            variant: 'Stone · 24–32',
            imageAlt:
              "Wide-leg tailored trousers in soft gray, women's contemporary pants",
          },
          {
            name: 'Relaxed Oxford Shirt',
            price: '$195',
            variant: 'White · XS–XXL',
            imageAlt:
              'Classic white button-down shirt with relaxed fit, unisex wardrobe essential',
          },
          {
            name: 'Vintage Wash Denim',
            price: '$245',
            variant: 'Indigo · 24–34',
            imageAlt:
              "High-waisted denim jeans in vintage wash, women's classic blue jeans",
          },
          {
            name: 'Minimal Leather Belt',
            price: '$425',
            variant: 'Off-White · One Size',
            badge: 'Limited',
            imageAlt:
              'Minimalist leather belt in off-white on a neutral background, unisex accessory',
          },
          {
            name: 'Silk Midi Slip Dress',
            price: '$595',
            variant: 'Champagne · XS–XL',
            imageAlt:
              "Silk midi slip dress in champagne color, women's elegant evening wear",
          },
        ]
    useSyncCommerceCatalog(
      lakebed,
      productItems.map((product) =>
        commerceProduct({
          imageAlt: product.imageAlt,
          label: product.name,
          price: product.price,
          subtitle: product.variant,
        }),
      ),
    )
    const visibleProductItems = useCommerceFilteredProducts(
      lakebed,
      productItems,
      (product) => [
        product.name,
        product.variant,
        product.price,
        product.badge,
        product.imageAlt,
      ],
    )
    const eyebrowCls =
      'font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground'
    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )
    return (
      <section
        aria-label="New arrivals"
        className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}
      >
        <Container>
          <div className="mb-16 grid items-end gap-8 lg:grid-cols-2 lg:gap-12">
            <SectionHeading
              align="left"
              eyebrow={productsEyebrow}
              title={productsHeading}
              className="gap-0"
              eyebrowClassName={cn(eyebrowCls, 'mb-3')}
              titleClassName="font-serif text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl"
            />
            <p className="max-w-md text-muted-foreground lg:ml-auto lg:text-right">
              {productsDesc}
            </p>
          </div>

          <ResponsiveGrid cols="2-lg-4" className="sm:gap-6 lg:gap-8 gap-4">
            {visibleProductItems.map((product) => (
              <ProductCard key={product.name} variant="none" className="group">
                <ProductCardImage className="relative mb-4 aspect-[3/4] overflow-hidden rounded-none bg-muted">
                  <Image
                    alt={product.imageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge ? (
                    <ProductCardBadge
                      className={cn(
                        'absolute left-3 top-3 rounded-none px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em]',
                        product.badge === 'Best Seller'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-foreground',
                      )}
                    >
                      {product.badge}
                    </ProductCardBadge>
                  ) : null}
                  <ProductCardActions asChild>
                    <CommerceAddItemButton
                      lakebed={lakebed}
                      item={{
                        label: product.name,
                        price: product.price,
                      }}
                      pendingChildren={
                        <>
                          <CommerceMutationSpinner />
                          Adding
                        </>
                      }
                      className="absolute inset-x-4 bottom-4 inline-flex items-center justify-center gap-2 rounded-none bg-background py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground opacity-0 transition-[opacity,transform] duration-150 group-hover:opacity-100 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                    >
                      {quickAdd}
                    </CommerceAddItemButton>
                  </ProductCardActions>
                </ProductCardImage>
                <ProductCardContent className="p-0">
                  <ProductCardTitle className="font-serif text-base font-normal text-foreground">
                    {product.name}
                  </ProductCardTitle>
                  <ProductCardPrice className="mt-1.5 text-sm text-foreground tabular-nums">
                    {product.price}
                  </ProductCardPrice>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {product.variant}
                  </p>
                </ProductCardContent>
              </ProductCard>
            ))}
          </ResponsiveGrid>

          <div className="mt-14 border-t border-border pt-8 text-center">
            <NavbarRouteLink
              className="inline-flex items-center border-b border-foreground pb-1 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-muted-foreground hover:text-muted-foreground"
              href={productsViewAll}
            >
              {productsViewAll}
              <ArrowRight className="ml-2 size-4" />
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
