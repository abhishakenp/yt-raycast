import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
} from '#/section-kit/GalleryGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useCommerceFilteredProducts,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { useCommerce } from '../commerce/commerce-provider.tsx'
import {
  resolveEcommerceGalleryProducts,
  type EcommerceGalleryVisualProduct,
} from './ecommerce-gallery-commerce.ts'

/**
 * EcommerceGallery — editorial-commerce featured products spread for a general
 * online store. An asymmetric header (left-aligned extrabold heading +
 * subheading, mono "[ catalog ]" item count on the right) above a staggered
 * 2-to-3 column grid of sharp product plates: each plate is a hairline-framed
 * square product Image sitting on an offset frame with an optional sharp
 * corner "Sale" tag, followed by a hairline ledger row pairing an index
 * numeral + product title with an oversized tabular price (and strikethrough
 * original price), and a square mono add-to-cart button with invert hover and
 * press feedback backed by the shared Lakebed cart. Alternating plates step
 * down on a vertical rhythm at every breakpoint. All imagery uses the
 * alt-driven Image component. Use to merchandise best sellers or a featured
 * catalog for any general retail / online store storefront.
 */
export const EcommerceGallery = defineCapsule({
  name: 'EcommerceGallery',
  description:
    "Editorial-commerce featured products spread for a general online store: an asymmetric header (left-aligned extrabold heading + subheading, mono '[ catalog ]' item count right) above a staggered 2-to-3 column grid of sharp product plates — each a hairline-framed square product Image on an offset frame with an optional sharp-corner 'Sale' tag, a hairline ledger row pairing an index numeral + product title with an oversized tabular price (and strikethrough original price), and a square mono 'Add to cart' button with invert hover and press feedback backed by the shared Lakebed cart. All imagery uses the alt-driven Image component. Use to merchandise best sellers or a featured catalog for any general retail / online store storefront (electronics, home goods, accessories, lifestyle products).",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    addToCartLabel: z.string().optional(),
    products: z
      .array(
        z.object({
          name: z.string(),
          handle: z.string().optional(),
          sourceId: z.string().optional(),
          price: z.string(),
          oldPrice: z.string().optional(),
          badge: z.string().optional(),
          imageAlt: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const galleryHeading = props.heading ?? 'Featured Products'
    const gallerySubheading =
      props.subheading ??
      'Shop our best sellers — handpicked favorites loved by thousands of customers.'
    const addToCartLabel = props.addToCartLabel ?? 'Add to cart'
    const galleryProducts: Array<EcommerceGalleryVisualProduct> = props.products
      ?.length
      ? props.products
      : [
          {
            name: 'Wireless Headphones',
            price: '$129',
            oldPrice: '$179',
            badge: 'Sale',
            imageAlt:
              'Over-ear wireless headphones in matte black on a clean studio background, online store product photo',
          },
          {
            name: 'Ceramic Coffee Mug',
            price: '$18',
            imageAlt:
              'Minimalist stoneware ceramic coffee mug in sand color on a neutral background, online store product photo',
          },
          {
            name: 'Everyday Backpack',
            price: '$89',
            oldPrice: '$119',
            badge: 'Sale',
            imageAlt:
              'Modern canvas everyday backpack in olive green on a clean background, online store product photo',
          },
          {
            name: 'Running Sneakers',
            price: '$95',
            imageAlt:
              'Lightweight white running sneakers with mesh upper on a studio background, online store product photo',
          },
          {
            name: 'Adjustable Desk Lamp',
            price: '$59',
            oldPrice: '$74',
            badge: 'Sale',
            imageAlt:
              'Sleek adjustable LED desk lamp in brushed metal on a minimal background, online store product photo',
          },
          {
            name: 'Insulated Water Bottle',
            price: '$32',
            imageAlt:
              'Stainless steel insulated water bottle in soft teal on a clean background, online store product photo',
          },
          {
            name: 'Polarized Sunglasses',
            price: '$74',
            imageAlt:
              'Classic polarized sunglasses with tortoiseshell frames on a neutral background, online store product photo',
          },
          {
            name: 'Hardcover Notebook',
            price: '$22',
            oldPrice: '$28',
            badge: 'Sale',
            imageAlt:
              'Premium hardcover dotted notebook in charcoal on a clean studio background, online store product photo',
          },
        ]
    const commerce = useCommerce()
    useSyncCommerceCatalog(
      lakebed,
      commerce.mode === 'demo'
        ? galleryProducts.map((product) =>
            commerceProduct({
              imageAlt: product.imageAlt,
              itemKey: product.sourceId ?? product.handle,
              label: product.name,
              price: product.price,
              subtitle: product.badge,
            }),
          )
        : [],
    )
    const runtimeProducts = resolveEcommerceGalleryProducts(
      galleryProducts,
      commerce,
    )
    const visibleProducts = useCommerceFilteredProducts(
      lakebed,
      runtimeProducts,
      (product) => [
        product.name,
        product.price,
        product.oldPrice,
        product.badge,
        product.imageAlt,
      ],
    )

    return (
      <section
        aria-label="Featured products"
        className={cn('bg-background py-20 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={galleryHeading}
              subtitle={gallerySubheading}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-sm text-muted-foreground sm:text-base"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
            >
              [ catalog ] {String(visibleProducts.length).padStart(2, '0')}{' '}
              items
            </p>
          </div>

          <GalleryGrid>
            <GalleryGridItems
              columns={3}
              className="items-start gap-x-6 gap-y-12 sm:gap-y-10"
            >
              {visibleProducts.map((product, index) => (
                <div
                  key={product.productSourceId}
                  className={cn(
                    'flex flex-col',
                    index % 2 === 1 && 'sm:translate-y-8 lg:translate-y-0',
                    index % 3 === 1 && 'lg:translate-y-10',
                  )}
                >
                  <div className="relative mr-2.5">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 translate-x-2.5 translate-y-2.5 border border-border"
                    />
                    <GalleryTile className="aspect-square rounded-none border-foreground/15 bg-muted">
                      <GalleryTileImage
                        src={product.imageSrc}
                        alt={product.imageAlt ?? product.name}
                        w={600}
                        h={600}
                        className="group-hover:scale-[1.03]"
                      />
                      {product.badge ? (
                        <span className="absolute left-0 top-0 border-b border-r border-foreground bg-background px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">
                          {product.badge}
                        </span>
                      ) : null}
                    </GalleryTile>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3 border-b border-border pb-3">
                    <div className="min-w-0">
                      <p
                        aria-hidden="true"
                        className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60 tabular-nums"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 className="mt-1 truncate text-sm font-semibold tracking-tight text-foreground">
                        {product.name}
                      </h3>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-2">
                      {product.oldPrice ? (
                        <s className="font-mono text-xs text-muted-foreground">
                          {product.oldPrice}
                        </s>
                      ) : null}
                      <span className="text-3xl font-extrabold leading-none tracking-tighter text-foreground tabular-nums">
                        {product.price}
                      </span>
                    </div>
                  </div>
                  <CommerceAddItemButton
                    disabled={!product.purchasable && commerce.mode !== 'demo'}
                    lakebed={lakebed}
                    item={{
                      itemKey: product.productSourceId,
                      label: product.name,
                      price: product.price,
                    }}
                    pendingChildren={<CommerceMutationSpinner />}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-none border border-foreground bg-background px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-150 hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                  >
                    {addToCartLabel}
                  </CommerceAddItemButton>
                </div>
              ))}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
