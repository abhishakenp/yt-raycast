import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  commerceProduct,
  useCommerceFilteredProducts,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * EcommerceGallery — Featured Products grid for a general online store. A
 * centered heading + optional subheading above a responsive 3-to-4 column grid
 * of square product cards, each inside a rounded bordered card with imagery,
 * an optional "Sale" corner badge, the product title, a price row with an
 * optional strikethrough original price, and a persistent full-width "Add to
 * cart" button backed by the shared Lakebed cart. All imagery
 * uses the alt-driven Image component. Use to merchandise best sellers or a
 * featured catalog for any general retail / online store storefront.
 */
export const EcommerceGallery = defineCapsule({
  name: 'EcommerceGallery',
  description:
    "Featured Products grid for a general online store: a centered heading + optional subheading above a responsive 3-to-4 column grid of square product cards, each inside a rounded bordered card with imagery, an optional 'Sale' corner badge, the product title, a price row with an optional strikethrough original price, and a persistent full-width 'Add to cart' button backed by the shared Lakebed cart. All imagery uses the alt-driven Image component. Use to merchandise best sellers or a featured catalog for any general retail / online store storefront (electronics, home goods, accessories, lifestyle products).",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    addToCartLabel: z.string().optional(),
    products: z
      .array(
        z.object({
          name: z.string(),
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
    const galleryProducts = props.products?.length
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
    useSyncCommerceCatalog(
      lakebed,
      galleryProducts.map((product) =>
        commerceProduct({
          imageAlt: product.imageAlt,
          label: product.name,
          price: product.price,
          subtitle: product.badge,
        }),
      ),
    )
    const visibleProducts = useCommerceFilteredProducts(
      lakebed,
      galleryProducts,
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
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              {galleryHeading}
            </h2>
            {gallerySubheading ? (
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                {gallerySubheading}
              </p>
            ) : null}
          </div>

          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {visibleProducts
                .map((p) => ({
                  alt: p.imageAlt ?? p.name,
                  caption: p.price,
                }))
                .map((img) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  return (
                    <GalleryTile key={__iv__.alt}>
                      <GalleryTileImage alt={__iv__.alt} />
                      {__iv__.caption && (
                        <GalleryTileCaption>
                          {__iv__.caption}
                        </GalleryTileCaption>
                      )}
                    </GalleryTile>
                  )
                })}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
