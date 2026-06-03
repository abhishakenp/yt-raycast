import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * IllustratorShop — an art-print shop section for an illustrator / visual-artist
 * portfolio. A centered uppercase accent eyebrow + serif heading + paragraph
 * sit above a responsive 4-up grid of product cards; each card has a square
 * product image that zooms on hover, a serif title, a small meta line, and a
 * price beside a pill "add to cart" button, with a centered outlined
 * "visit full shop" CTA beneath. Every add-to-cart and the shop CTA route
 * through useNavigate. Use to sell limited-edition prints, greeting cards, and
 * illustrated goods. Renders fully with no props via baked-in defaults.
 */
export const IllustratorShop = defineComponent({
  name: "IllustratorShop",
  description:
    "Art-print shop section for an illustrator / visual-artist portfolio: a centered uppercase accent eyebrow + serif heading + paragraph above a responsive 4-up grid of product cards, each with a square product image that zooms on hover, a serif title, small meta line, and a price beside a pill 'add to cart' button, plus a centered outlined 'visit full shop' CTA beneath. Add-to-cart and the shop CTA route through useNavigate. Use to sell limited-edition prints, greeting cards, and illustrated goods.",
  props: z.object({
    /** Uppercase accent eyebrow label. */
    eyebrow: z.string().optional(),
    /** Serif section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Outlined CTA label beneath the grid. */
    cta: z.string().optional(),
    /** Per-card add-to-cart button label. */
    addToCart: z.string().optional(),
    /** Product cards. */
    items: z
      .array(
        z.object({
          title: z.string(),
          meta: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "Art Shop"
    const heading = props.heading ?? "Prints & Products"
    const description =
      props.description ??
      "Limited edition prints, greeting cards, and illustrated goods shipped worldwide from my Portland studio."
    const cta = props.cta ?? "Visit Full Shop"
    const addToCart = props.addToCart ?? "Add to Cart"
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Golden Hour Mountains",
            meta: 'Giclée print · 11"×14"',
            price: "$48",
          },
          {
            title: "Botanical Dreams",
            meta: 'Giclée print · 8"×10"',
            price: "$32",
          },
          {
            title: "Cozy Reading Corner",
            meta: 'Giclée print · 11"×14"',
            price: "$48",
          },
          {
            title: "Seasonal Card Set",
            meta: "8 cards + envelopes",
            price: "$24",
          },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
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

    return (
      <section
        className={cn(
          "bg-background px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-chart-2">
              {eyebrow}
            </p>
            <h2 className="mb-6 font-serif text-3xl sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.title}
                className="group overflow-hidden rounded-lg border border-border/60 bg-card transition-shadow hover:shadow-lg"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <Image
                    alt={item.title}
                    w={500}
                    h={500}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="mb-1 font-serif text-lg text-card-foreground">
                    {item.title}
                  </h3>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {item.meta}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-card-foreground">
                      {item.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => go(addToCart)}
                      className="rounded-full bg-foreground px-4 py-2 text-sm text-background transition-colors hover:bg-muted-foreground"
                    >
                      {addToCart}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => go(cta)}
              className="inline-flex items-center gap-2 rounded-full border border-foreground px-8 py-4 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {cta}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>
    )
  },
})
