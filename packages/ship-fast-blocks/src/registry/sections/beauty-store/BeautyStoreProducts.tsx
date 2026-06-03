import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * BeautyStoreProducts — shoppable bestsellers product grid for a beauty / skincare /
 * cosmetics e-commerce landing page. A section eyebrow + heading on the left with a
 * "view all" link on the right, above a responsive 2-to-4-column grid of product
 * cards. Each card has an alt-driven square product photo zooming on hover, an
 * optional status badge (Bestseller / Clean / New mapped to primary / secondary /
 * accent), a floating add-to-cart button that appears on hover, the brand name,
 * product title, star rating strip + review count, and price. CTAs and product
 * clicks route through useNavigate. Use on beauty store homepages, product showcase
 * sections, skincare shop grids, makeup bestsellers, or any e-commerce product
 * listing. Renders fully with no props via 8 clean-beauty baked-in defaults.
 */
export const BeautyStoreProducts = defineComponent({
  name: "BeautyStoreProducts",
  description:
    "Shoppable bestsellers product grid for a beauty / skincare / cosmetics e-commerce landing page: a section eyebrow and heading on the left with a 'view all' link on the right, above a responsive 2-to-4-column grid of product cards. Each card has an alt-driven square product photo that zooms on hover, an optional status badge (Bestseller / Clean / New), a floating add-to-cart button that appears on hover, brand name, product title, star rating strip + review count, and price. CTAs and product clicks route through useNavigate. Use on beauty store homepages, skincare shop grids, makeup bestsellers, or any e-commerce product listing.",
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
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "Most Loved"
    const heading = props.heading ?? "Bestsellers"
    const viewAll = props.viewAll ?? "View All Products"
    const items = props.items?.length
      ? props.items
      : [
          {
            brand: "The Ordinary",
            title: "Hyaluronic Acid 2% + B5 Hydrating Serum",
            price: "$8.90",
            reviews: "(2,847)",
            badge: "Bestseller",
          },
          {
            brand: "Glow Recipe",
            title: "Watermelon Glow Sleeping Mask",
            price: "$45.00",
            reviews: "(1,932)",
            badge: "Clean",
          },
          {
            brand: "Laneige",
            title: "BB Cushion Foundation SPF 50",
            price: "$39.00",
            reviews: "(4,156)",
            badge: "New",
          },
          {
            brand: "Rare Beauty",
            title: "Soft Pinch Liquid Blush - Hope",
            price: "$23.00",
            reviews: "(8,421)",
          },
          {
            brand: "CeraVe",
            title: "Moisturizing Cream with Ceramides",
            price: "$16.99",
            reviews: "(15,203)",
            badge: "Bestseller",
          },
          {
            brand: "Fenty Beauty",
            title: "Gloss Bomb Universal Lip Luminizer",
            price: "$21.00",
            reviews: "(6,789)",
          },
          {
            brand: "Drunk Elephant",
            title: "Protini Polypeptide Cream",
            price: "$68.00",
            reviews: "(3,245)",
            badge: "Clean",
          },
          {
            brand: "Charlotte Tilbury",
            title: "Airbrush Flawless Finish Setting Powder",
            price: "$45.00",
            reviews: "(2,156)",
            badge: "New",
          },
        ]

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
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

    const badgeClass = (badge?: string) => {
      if (badge === "Clean") return "bg-secondary text-secondary-foreground"
      if (badge === "New") return "bg-accent text-accent-foreground"
      return "bg-primary text-primary-foreground"
    }

    return (
      <section
        className={cn("bg-muted/40 py-20 lg:py-28", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary">
                {eyebrow}
              </span>
              <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                {heading}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {viewAll}
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {items.map((product) => (
              <article
                key={product.title}
                className="group overflow-hidden rounded-xl bg-card shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    alt={`${product.brand} ${product.title} product photo`}
                    w={600}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge ? (
                    <span
                      className={cn(
                        "absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-semibold",
                        badgeClass(product.badge),
                      )}
                    >
                      {product.badge}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Add ${product.title} to cart`}
                    onClick={() => go(product.title)}
                    className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-card text-card-foreground opacity-0 shadow-md transition-opacity hover:bg-foreground hover:text-background group-hover:opacity-100"
                  >
                    <PlusIcon />
                  </button>
                </div>
                <div className="p-4">
                  <p className="mb-1 text-xs text-muted-foreground">
                    {product.brand}
                  </p>
                  <h3 className="mb-2 line-clamp-2 font-medium text-card-foreground">
                    {product.title}
                  </h3>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex text-primary">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className="size-3" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {product.reviews}
                    </span>
                  </div>
                  <p className="font-semibold text-card-foreground">
                    {product.price}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
