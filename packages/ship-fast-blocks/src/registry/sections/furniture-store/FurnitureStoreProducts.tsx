import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * FurnitureStoreProducts — a best-sellers product grid. A header row (eyebrow +
 * heading left, arrow "shop all" link right) above a responsive 1/2/4-column grid
 * of product cards; each card has a square image that zooms on hover, an optional
 * corner badge (Sale tinted destructive, otherwise primary), a hover-revealed
 * add-to-cart button, a product name link, a variant subtitle, and a price line
 * that shows a struck-through original price when on sale. Card links, the
 * add-to-cart buttons, and the view-all link route through useNavigate. Use as
 * the product / shop grid for furniture, home-decor, or any retail store. Renders
 * fully with no props via baked-in "Haven & Home" defaults.
 */
export const FurnitureStoreProducts = defineComponent({
  name: 'FurnitureStoreProducts',
  description:
    "Best-sellers product grid: a header row (eyebrow + heading left, arrow 'shop all' link right) above a responsive 1/2/4-column grid of product cards; each card has a square image that zooms on hover, an optional corner badge (Sale tinted destructive, else primary), a hover-revealed add-to-cart button, a product name link, a variant subtitle, and a price line showing a struck-through original price when on sale. Card links, add-to-cart, and view-all route through useNavigate. Use as the product / shop grid for furniture, home-decor, or any retail store.",
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
  component: ({ props }) => {
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            {items.map((product) => (
              <article key={product.name} className="group">
                <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-muted">
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
                    <span
                      className={cn(
                        'absolute left-3 top-3 rounded-sm px-2 py-1 text-xs font-medium',
                        product.badge.toLowerCase() === 'sale'
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-primary text-primary-foreground',
                      )}
                    >
                      {product.badge}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => go(`Add ${product.name}`)}
                    className="absolute bottom-3 right-3 rounded-full bg-card p-2 opacity-0 shadow transition-opacity group-hover:opacity-100"
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
                  </button>
                </div>
                <h3 className="mb-1 font-medium">
                  <button
                    type="button"
                    onClick={() => go(product.name)}
                    className="transition-colors hover:text-muted-foreground"
                  >
                    {product.name}
                  </button>
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  {product.variant}
                </p>
                <p className="font-medium">
                  {product.oldPrice ? (
                    <span className="mr-2 text-muted-foreground/70 line-through">
                      {product.oldPrice}
                    </span>
                  ) : null}
                  {product.price}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
