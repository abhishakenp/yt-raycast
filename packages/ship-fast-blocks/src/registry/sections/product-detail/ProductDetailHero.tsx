import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { useState } from "react"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

export const ProductDetailHero = defineComponent({
  name: "ProductDetailHero",
  description:
    "Premium two-column product detail hero / buy box for a single flagship product (Aurora Pro Headphones). The left column shows a large square product photo rendered through the alt-driven Image component; the right column is a conversion-focused buy box with product title, an inline 5-star rating with review count, a price row with optional strike-through compare price, a short product blurb, selectable variant pills (color / size options) backed by local state, and a dual CTA row (Add to Cart primary, Buy Now secondary) wired through the navigate helper. Use when composing a product detail page that needs a polished above-the-fold purchase experience without generating new HTML.",
  props: z.object({
    title: z.string().optional(),
    price: z.string().optional(),
    comparePrice: z.string().optional(),
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
    description: z.string().optional(),
    imageAlt: z.string().optional(),
    variants: z.array(z.string()).optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [sel, setSel] = useState(0)
    const title = props.title ?? "Aurora Pro Headphones"
    const price = props.price ?? "$299"
    const comparePrice = props.comparePrice ?? "$349"
    const rating = props.rating ?? 4.8
    const reviewCount = props.reviewCount ?? 1240
    const description =
      props.description ??
      "Studio-grade adaptive noise cancellation, 40-hour battery life, and plush memory-foam ear cushions engineered for all-day listening. The flagship Aurora sound, refined."
    const imageAlt = props.imageAlt ?? "Aurora Pro Headphones premium product photo"
    const variants = props.variants?.length
      ? props.variants
      : ["Midnight Black", "Arctic Silver", "Aurora Blue"]
    const primaryCta = props.primaryCta ?? "Add to Cart"
    const secondaryCta = props.secondaryCta ?? "Buy Now"

    return (
      <section className={cn("bg-background py-12 sm:py-20", props.className)}>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-start lg:px-8">
          <div>
            <Image
              alt={imageAlt}
              w={800}
              h={800}
              className="aspect-square w-full rounded-xl border border-border object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((i) => (
                  <svg
                    key={i}
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    className="text-accent fill-current"
                    aria-hidden="true"
                  >
                    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {rating} · ({reviewCount} reviews)
              </span>
            </div>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">{price}</span>
              {comparePrice ? (
                <span className="text-lg text-muted-foreground line-through">{comparePrice}</span>
              ) : null}
            </div>
            <p className="mt-5 text-base leading-7 text-muted-foreground">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {variants.map((v, i) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSel(i)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    sel === i
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => go(primaryCta)}
                className="flex-1 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryCta)}
                className="flex-1 rounded-full border border-border bg-background px-6 py-3 font-semibold text-foreground transition hover:bg-muted"
              >
                {secondaryCta}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
