import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { FilterChip } from '#/section-kit/index.ts'
import {
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardActions,
  ProductCardContent,
  ProductCardTitle,
  ProductCardSubtitle,
} from '#/section-kit/ProductCard.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  commerceProduct,
  useCommerceFilteredProducts,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * ElectronicsStoreProducts — a "Trending Products" catalog grid on a muted band
 * for an electronics storefront. A header row pairs a heading with filter chips
 * (first chip primary-active), above a 1-to-4 column grid of product cards: a
 * square image with an optional corner badge and a floating round add-to-cart
 * button, then title, subtitle, price and a star rating. A centered outlined
 * "View All" button closes the section. Add-to-cart writes to the shared
 * Lakebed cart; chips and view-all route through useNavigate. Use as the main catalog grid on electronics or gadget storefronts.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
export const ElectronicsStoreProducts = defineCapsule({
  name: 'ElectronicsStoreProducts',
  description:
    'Trending Products catalog grid on a muted band for an electronics storefront: a header row pairs a heading with filter chips (first chip primary-active), above a 1-to-4 column grid of product cards — square image with an optional corner badge (Best Seller / New) and a floating round add-to-cart button that writes to the shared Lakebed cart, then title, subtitle, price and a star rating. A centered outlined View All button closes the section. Chips and view-all route through useNavigate; imagery is alt-driven. Use as the main catalog grid on electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Filter chip labels (first is the active state). */
    filters: z.array(z.string()).optional(),
    /** Trailing View All button label. */
    viewAll: z.string().optional(),
    /** Product cards. */
    items: z
      .array(
        z.object({
          title: z.string(),
          subtitle: z.string(),
          price: z.string(),
          rating: z.string(),
          imageAlt: z.string(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trending Products'
    const filters = props.filters?.length
      ? props.filters
      : ['All', 'New', 'Popular']
    const viewAll = props.viewAll ?? 'View All Products'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Bose QuietComfort Ultra',
            subtitle: 'Wireless Noise Cancelling',
            price: '$429.00',
            rating: '4.8',
            badge: 'New',
            imageAlt:
              'Bose QuietComfort Ultra wireless noise cancelling headphones in black',
          },
          {
            title: 'Galaxy Watch 6 Classic',
            subtitle: '47mm, Bluetooth',
            price: '$349.99',
            rating: '4.7',
            imageAlt:
              'Samsung Galaxy Watch 6 Classic with rotating bezel and leather strap',
          },
          {
            title: 'Marshall Emberton II',
            subtitle: 'Portable Speaker',
            price: '$149.99',
            rating: '4.9',
            badge: 'Best Seller',
            imageAlt:
              'Marshall Emberton II portable bluetooth speaker in black and brass',
          },
          {
            title: 'Keychron Q1 Pro',
            subtitle: 'Wireless Mechanical',
            price: '$199.00',
            rating: '4.6',
            imageAlt:
              'Mechanical gaming keyboard with RGB backlighting and custom keycaps',
          },
          {
            title: 'Dell XPS 15',
            subtitle: 'Intel Core i7, 16GB RAM',
            price: '$1,549.00',
            rating: '4.7',
            imageAlt:
              'Dell XPS 15 laptop with infinity edge display on modern desk',
          },
          {
            title: 'DJI Mini 4 Pro',
            subtitle: 'Drone with RC 2',
            price: '$759.00',
            rating: '4.9',
            badge: 'New',
            imageAlt:
              'DJI Mini 4 Pro drone with remote controller on outdoor grass',
          },
          {
            title: 'Fujifilm X100VI',
            subtitle: '40MP, Silver',
            price: '$1,599.00',
            rating: '4.8',
            imageAlt:
              'Fujifilm X100VI premium compact camera in silver with vintage design',
          },
          {
            title: 'Canon EOS R6 Mark II',
            subtitle: 'Body Only',
            price: '$2,499.00',
            rating: '4.9',
            imageAlt:
              'Canon EOS R6 Mark II mirrorless camera with RF lens attached',
          },
        ]
    useSyncCommerceCatalog(
      lakebed,
      items.map((product) =>
        commerceProduct({
          imageAlt: product.imageAlt,
          label: product.title,
          price: product.price,
          subtitle: product.subtitle,
        }),
      ),
    )
    const visibleItems = useCommerceFilteredProducts(
      lakebed,
      items,
      (product) => [
        product.title,
        product.subtitle,
        product.price,
        product.badge,
      ],
    )
    const ArrowRight = () => (
      <svg
        className="ml-2 size-4"
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
    const Star = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-4', className)}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
    return (
      <section className={cn('bg-muted/40 py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              className="gap-0"
              titleClassName="text-2xl font-semibold text-foreground"
            />
            <div className="flex gap-2">
              {filters.map((f, i) => (
                <FilterChip
                  key={f}
                  active={i === 0}
                  variant={i === 0 ? 'default' : 'outline'}
                  className="rounded-lg"
                  onClick={() => go(f)}
                >
                  {f}
                </FilterChip>
              ))}
            </div>
          </div>

          <ResponsiveGrid cols="1-2-4" gap="md">
            {visibleItems.map((p) => (
              <ProductCard
                key={p.title}
                variant="elevated"
                className="transition-shadow hover:shadow-lg"
              >
                <ProductCardImage className="overflow-visible">
                  <Image
                    alt={p.imageAlt}
                    w={400}
                    h={400}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {p.badge ? (
                    <ProductCardBadge
                      className={cn(
                        'rounded',
                        p.badge === 'Best Seller'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-foreground text-background',
                      )}
                    >
                      {p.badge}
                    </ProductCardBadge>
                  ) : null}
                  <ProductCardActions>
                    <CommerceAddItemButton
                      lakebed={lakebed}
                      item={{
                        label: p.title,
                        price: p.price,
                      }}
                      aria-label={`Add ${p.title} to cart`}
                      className="grid size-10 place-items-center rounded-full bg-card text-card-foreground shadow-md transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-70"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 4v16m8-8H4" />
                      </svg>
                    </CommerceAddItemButton>
                  </ProductCardActions>
                </ProductCardImage>
                <ProductCardContent className="p-4">
                  <ProductCardTitle className="mb-1 text-card-foreground">
                    {p.title}
                  </ProductCardTitle>
                  <ProductCardSubtitle className="mb-3 mt-0">
                    {p.subtitle}
                  </ProductCardSubtitle>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-card-foreground">
                      {p.price}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="text-chart-4" />
                      <span className="text-sm text-muted-foreground">
                        {p.rating}
                      </span>
                    </div>
                  </div>
                </ProductCardContent>
              </ProductCard>
            ))}
          </ResponsiveGrid>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 font-medium text-card-foreground transition-colors hover:bg-accent"
            >
              {viewAll}
              <ArrowRight />
            </button>
          </div>
        </Container>
      </section>
    )
  },
})
