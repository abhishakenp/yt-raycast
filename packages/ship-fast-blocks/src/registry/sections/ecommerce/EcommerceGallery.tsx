import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * EcommerceGallery — Featured Products grid for a general online store. A
 * centered heading + optional subheading above a responsive 3-to-4 column grid
 * of square product cards, each inside a rounded bordered card with imagery,
 * an optional "Sale" corner badge, the product title, a price row with an
 * optional strikethrough original price, and a persistent full-width "Add to
 * cart" button. Every card action routes through useNavigate and all imagery
 * uses the alt-driven Image component. Use to merchandise best sellers or a
 * featured catalog for any general retail / online store storefront.
 */
export const EcommerceGallery = defineComponent({
  name: 'EcommerceGallery',
  description:
    "Featured Products grid for a general online store: a centered heading + optional subheading above a responsive 3-to-4 column grid of square product cards, each inside a rounded bordered card with imagery, an optional 'Sale' corner badge, the product title, a price row with an optional strikethrough original price, and a persistent full-width 'Add to cart' button. Every card action routes through useNavigate and all imagery uses the alt-driven Image component. Use to merchandise best sellers or a featured catalog for any general retail / online store storefront (electronics, home goods, accessories, lifestyle products).",
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
  component: ({ props }) => {
    const go = useNavigate()
    const galleryHeading = props.heading ?? 'Featured Products'
    const gallerySubheading =
      props.subheading ??
      'Shop our best sellers — handpicked favorites loved by thousands of customers.'
    const addToCartLabel = props.addToCartLabel ?? 'Add to cart'
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

    return (
      <section
        aria-label="Featured products"
        className={cn('bg-background py-20 lg:py-28', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {galleryProducts.map((product) => (
              <article
                key={product.name}
                className="group overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    alt={
                      product.imageAlt ??
                      `${product.name} product photo on a clean background, online store`
                    }
                    w={800}
                    h={800}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge ? (
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                      {product.badge}
                    </span>
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-foreground sm:text-base">
                    {product.name}
                  </h3>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-semibold text-foreground">
                      {product.price}
                    </span>
                    {product.oldPrice ? (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.oldPrice}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => go(product.name)}
                    className="mt-4 w-full rounded-md border border-primary bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-background hover:text-foreground"
                  >
                    {addToCartLabel}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
