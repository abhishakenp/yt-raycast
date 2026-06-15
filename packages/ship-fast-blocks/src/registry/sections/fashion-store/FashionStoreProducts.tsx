import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FashionStoreProducts — New Arrivals product grid for a minimalist fashion
 * store. A centered eyebrow + serif heading + description intro above a
 * responsive 2-to-4 column grid of portrait product cards, each with a hover
 * Quick-Add button overlay, optional New/Best Seller/Limited corner badge,
 * product name, price and variant label, closed by an underlined "View All"
 * link with an arrow. Every card and link routes through useNavigate and all
 * imagery uses the alt-driven Image component. Use to showcase a curated
 * product drop for clothing brands, boutiques, or apparel shops.
 */
export const FashionStoreProducts = defineComponent({
  name: "FashionStoreProducts",
  description:
    "New Arrivals product grid for a minimalist fashion store: a centered eyebrow + serif heading + description intro above a responsive 2-to-4 column grid of portrait product cards, each with a hover Quick-Add button overlay, optional New/Best Seller/Limited corner badge, product name, price and variant label, closed by an underlined 'View All' link with an arrow. Every card and link routes through useNavigate and all imagery uses the alt-driven Image component. Use to showcase a curated product drop for clothing brands, boutiques, apparel and accessories shops.",
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
  component: ({ props }) => {
    const go = useNavigate()
    const productsEyebrow = props.eyebrow ?? "Just Dropped"
    const productsHeading = props.heading ?? "New Arrivals"
    const productsDesc =
      props.description ??
      "The latest pieces from our Spring/Summer collection. Fresh silhouettes, timeless materials."
    const productsViewAll = props.viewAll ?? "View All New Arrivals"
    const quickAdd = props.quickAdd ?? "Quick Add"
    const productItems = props.items?.length
      ? props.items
      : [
          {
            name: "Oversized Linen Blazer",
            price: "$485",
            variant: "Cream · XS–XL",
            badge: "New",
            imageAlt:
              "Cream-colored oversized linen blazer on minimal background, women's tailored outerwear",
          },
          {
            name: "Structured Wool Coat",
            price: "$895",
            variant: "Charcoal · S–XXL",
            imageAlt:
              "Structured charcoal wool coat with wide lapels, men's winter outerwear",
          },
          {
            name: "Cashmere Blend Knit",
            price: "$295",
            variant: "Oatmeal · XS–XL",
            badge: "Best Seller",
            imageAlt:
              "Minimalist beige knit sweater with ribbed texture, unisex everyday essential",
          },
          {
            name: "Wide-Leg Tailored Trousers",
            price: "$345",
            variant: "Stone · 24–32",
            imageAlt:
              "Wide-leg tailored trousers in soft gray, women's contemporary pants",
          },
          {
            name: "Relaxed Oxford Shirt",
            price: "$195",
            variant: "White · XS–XXL",
            imageAlt:
              "Classic white button-down shirt with relaxed fit, unisex wardrobe essential",
          },
          {
            name: "Vintage Wash Denim",
            price: "$245",
            variant: "Indigo · 24–34",
            imageAlt:
              "High-waisted denim jeans in vintage wash, women's classic blue jeans",
          },
          {
            name: "Minimal Leather Belt",
            price: "$425",
            variant: "Off-White · One Size",
            badge: "Limited",
            imageAlt:
              "Minimalist leather belt in off-white on a neutral background, unisex accessory",
          },
          {
            name: "Silk Midi Slip Dress",
            price: "$595",
            variant: "Champagne · XS–XL",
            imageAlt:
              "Silk midi slip dress in champagne color, women's elegant evening wear",
          },
        ]

    const eyebrowCls =
      "text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"

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
        className={cn("py-20 lg:py-32", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className={cn(eyebrowCls, "mb-3")}>{productsEyebrow}</p>
            <h2 className="mb-4 font-serif text-4xl font-normal sm:text-5xl lg:text-6xl">
              {productsHeading}
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              {productsDesc}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {productItems.map((product) => (
              <article key={product.name} className="group">
                <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-muted">
                  <Image
                    alt={product.imageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge ? (
                    <div className="absolute left-3 top-3">
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-medium",
                          product.badge === "Best Seller"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-foreground",
                        )}
                      >
                        {product.badge}
                      </span>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => go(product.name)}
                    className="absolute inset-x-4 bottom-4 bg-background py-3 text-sm font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    {quickAdd}
                  </button>
                </div>
                <h3 className="text-sm font-medium text-foreground">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.price}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product.variant}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => go(productsViewAll)}
              className="inline-flex items-center border-b border-foreground pb-1 text-sm font-medium text-foreground transition-colors hover:border-muted-foreground hover:text-muted-foreground"
            >
              {productsViewAll}
              <ArrowRight className="ml-2 size-4" />
            </button>
          </div>
        </div>
      </section>
    )
  },
})
