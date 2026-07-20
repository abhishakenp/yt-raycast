import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardContent,
  ProductCardTitle,
  ProductCardSubtitle,
} from '#/section-kit/ProductCard.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useCommerceFilteredProducts,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * ElectronicsStoreDeals — a tech-brutalist inverted "Flash Deals" band for an
 * electronics storefront. A bg-foreground/text-background section that cuts in on
 * a slanted clip-path seam behind a giant ghost watermark word; a mono deal
 * ticker strip runs above a header row pairing a mono index eyebrow + extrabold
 * heading + muted description with squared border-2 countdown tiles (hrs / min /
 * sec). Below sits a responsive 1-to-4 grid of clickable hard-shadow product
 * cards: square image with a squared destructive discount badge, then title, mono
 * subtitle, current tabular price and a struck-through original price. Cards add
 * to the shared Lakebed cart. Use to spotlight limited-time offers on electronics
 * stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { DealsGrid } from '#/section-kit/DealsGrid.tsx'
export const ElectronicsStoreDeals = defineCapsule({
  name: 'ElectronicsStoreDeals',
  description:
    'Tech-brutalist inverted Flash Deals band for an electronics storefront: a bg-foreground/text-background section that cuts in on a slanted clip-path seam behind a giant ghost watermark word, with a mono deal ticker strip above a header row pairing a mono index eyebrow + extrabold heading + muted description with squared border-2 countdown tiles (hrs / min / sec), above a responsive 1-to-4 grid of clickable hard-shadow product cards — square image with a squared destructive discount badge, then title, mono subtitle, current tabular price and a struck-through original price. Cards add to the shared Lakebed cart; imagery is alt-driven. Use to spotlight limited-time offers on electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.',
  props: z.object({
    /** Band heading. */
    heading: z.string().optional(),
    /** Muted description under the heading. */
    description: z.string().optional(),
    /** Label preceding the countdown timer. */
    countdownLabel: z.string().optional(),
    /** Countdown tiles. */
    countdown: z
      .array(
        z.object({
          value: z.string(),
          unit: z.string(),
        }),
      )
      .optional(),
    /** Discounted product cards. */
    items: z
      .array(
        z.object({
          title: z.string(),
          subtitle: z.string(),
          price: z.string(),
          was: z.string(),
          discount: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Flash Deals'
    const description =
      props.description ??
      'Limited-time offers on top-rated electronics. Ends May 31, 2025.'
    const countdownLabel = props.countdownLabel ?? 'Offer ends in:'
    const countdown = props.countdown?.length
      ? props.countdown
      : [
          {
            value: '06',
            unit: 'hrs',
          },
          {
            value: '42',
            unit: 'min',
          },
          {
            value: '18',
            unit: 'sec',
          },
        ]
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'AirPods Pro 2',
            subtitle: 'Active Noise Cancellation',
            price: '$224.99',
            was: '$299.99',
            discount: '-25%',
            imageAlt:
              'Apple AirPods Pro 2nd generation wireless earbuds in white charging case',
          },
          {
            title: 'Apple Watch Series 9',
            subtitle: '45mm, Midnight',
            price: '$319.99',
            was: '$399.99',
            discount: '-20%',
            imageAlt:
              'Apple Watch Series 9 smartwatch with midnight aluminum case and sport band',
          },
          {
            title: 'iPad Air M2',
            subtitle: '11-inch, 256GB',
            price: '$594.99',
            was: '$699.99',
            discount: '-15%',
            imageAlt:
              'iPad Air 5th generation tablet with 10.9 inch Liquid Retina display in space gray',
          },
          {
            title: 'MX Master 3S',
            subtitle: 'Wireless Mouse',
            price: '$69.99',
            was: '$99.99',
            discount: '-30%',
            imageAlt:
              'Logitech MX Master 3S wireless ergonomic mouse in graphite gray',
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
        product.was,
        product.discount,
        product.imageAlt,
      ],
    )
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-28 lg:pt-32',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 right-0 select-none font-mono text-[8rem] font-extrabold leading-none tracking-tighter text-background/[0.05] sm:text-[12rem]"
        >
          DEALS
        </span>
        <Container className="relative">
          <div
            aria-hidden="true"
            className="mb-8 flex items-center gap-3 overflow-hidden whitespace-nowrap border-y-2 border-background/30 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background/60"
          >
            <span className="text-background">● Flash Sale</span>
            <span>/ Limited Stock</span>
            <span className="text-background">/ Free 2-Day Shipping</span>
            <span className="hidden sm:inline">/ Price Match</span>
            <span className="ml-auto tabular-nums text-background">LIVE</span>
          </div>
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                <span className="tabular-nums">[ 03 ]</span>
                <span className="text-background/60">Offers</span>
              </span>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-0"
                titleClassName="mb-2 text-3xl font-extrabold tracking-tight text-background md:text-4xl"
                subtitleClassName="text-background/60"
              />
            </div>
            <div className="flex items-center gap-4 rounded-none border-2 border-background/40 p-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-background/60">
                {countdownLabel}
              </span>
              <div className="flex gap-2">
                {countdown.map((c) => (
                  <div key={c.unit} className="text-center">
                    <div className="grid size-12 place-items-center rounded-none border-2 border-background bg-background text-lg font-extrabold tabular-nums text-foreground">
                      {c.value}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-background/50">
                      {c.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DealsGrid cols="1-2-4" className="gap-6">
            {visibleItems.map((d) => (
              <ProductCard
                key={d.title}
                asChild
                variant="elevated"
                className="rounded-none border-2 border-background text-left shadow-[6px_6px_0_0] shadow-background transition-all duration-150 hover:-translate-y-1 hover:shadow-[9px_9px_0_0] motion-reduce:transform-none"
              >
                <CommerceAddItemButton
                  lakebed={lakebed}
                  item={{
                    label: d.title,
                    price: d.price,
                  }}
                  pendingChildren={<CommerceMutationSpinner />}
                >
                  <ProductCardImage className="overflow-visible border-b-2 border-foreground">
                    <Image
                      alt={d.imageAlt}
                      w={400}
                      h={400}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <ProductCardBadge className="rounded-none border-2 border-foreground bg-destructive px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-destructive-foreground">
                      {d.discount}
                    </ProductCardBadge>
                  </ProductCardImage>
                  <ProductCardContent className="block p-4">
                    <ProductCardTitle className="mb-1 font-semibold text-card-foreground">
                      {d.title}
                    </ProductCardTitle>
                    <ProductCardSubtitle className="mb-3 mt-0 font-mono text-xs uppercase tracking-[0.08em]">
                      {d.subtitle}
                    </ProductCardSubtitle>
                    <div className="flex items-baseline gap-2 border-t-2 border-dotted border-border pt-3">
                      <span className="text-xl font-extrabold tabular-nums tracking-tight text-card-foreground">
                        {d.price}
                      </span>
                      <span className="text-sm tabular-nums text-muted-foreground line-through">
                        {d.was}
                      </span>
                    </div>
                  </ProductCardContent>
                </CommerceAddItemButton>
              </ProductCard>
            ))}
          </DealsGrid>
        </Container>
      </section>
    )
  },
})
