import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ElectronicsStoreDeals — a dark inverted "Flash Deals" band for an electronics
 * storefront. A header row pairs a heading + muted description with a boxed
 * countdown timer (hrs / min / sec tiles), above a responsive 1-to-4 grid of
 * clickable product cards: square image with a destructive discount badge, then
 * title, subtitle, current price and a struck-through original price. Cards
 * route through useNavigate. Use to spotlight limited-time offers on electronics
 * stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.
 */
export const ElectronicsStoreDeals = defineComponent({
  name: "ElectronicsStoreDeals",
  description:
    "Dark inverted Flash Deals band for an electronics storefront: a header row pairs a heading + muted description with a boxed countdown timer (hrs / min / sec tiles), above a responsive 1-to-4 grid of clickable product cards — square image with a destructive discount badge, then title, subtitle, current price and a struck-through original price. Cards route through useNavigate; imagery is alt-driven. Use to spotlight limited-time offers on electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.",
  props: z.object({
    /** Band heading. */
    heading: z.string().optional(),
    /** Muted description under the heading. */
    description: z.string().optional(),
    /** Label preceding the countdown timer. */
    countdownLabel: z.string().optional(),
    /** Countdown tiles. */
    countdown: z
      .array(z.object({ value: z.string(), unit: z.string() }))
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
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Flash Deals"
    const description =
      props.description ??
      "Limited-time offers on top-rated electronics. Ends May 31, 2025."
    const countdownLabel = props.countdownLabel ?? "Offer ends in:"
    const countdown = props.countdown?.length
      ? props.countdown
      : [
          { value: "06", unit: "hrs" },
          { value: "42", unit: "min" },
          { value: "18", unit: "sec" },
        ]
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "AirPods Pro 2",
            subtitle: "Active Noise Cancellation",
            price: "$224.99",
            was: "$299.99",
            discount: "-25%",
            imageAlt:
              "Apple AirPods Pro 2nd generation wireless earbuds in white charging case",
          },
          {
            title: "Apple Watch Series 9",
            subtitle: "45mm, Midnight",
            price: "$319.99",
            was: "$399.99",
            discount: "-20%",
            imageAlt:
              "Apple Watch Series 9 smartwatch with midnight aluminum case and sport band",
          },
          {
            title: "iPad Air M2",
            subtitle: "11-inch, 256GB",
            price: "$594.99",
            was: "$699.99",
            discount: "-15%",
            imageAlt:
              "iPad Air 5th generation tablet with 10.9 inch Liquid Retina display in space gray",
          },
          {
            title: "MX Master 3S",
            subtitle: "Wireless Mouse",
            price: "$69.99",
            was: "$99.99",
            discount: "-30%",
            imageAlt:
              "Logitech MX Master 3S wireless ergonomic mouse in graphite gray",
          },
        ]

    return (
      <section
        className={cn("bg-foreground py-16 text-background", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-semibold text-background">
                {heading}
              </h2>
              <p className="text-background/60">{description}</p>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-background/10 p-4">
              <span className="text-sm text-background/60">
                {countdownLabel}
              </span>
              <div className="flex gap-2">
                {countdown.map((c) => (
                  <div key={c.unit} className="text-center">
                    <div className="grid size-12 place-items-center rounded-lg bg-background text-lg font-semibold text-foreground">
                      {c.value}
                    </div>
                    <div className="mt-1 text-xs text-background/50">
                      {c.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((d) => (
              <button
                key={d.title}
                type="button"
                onClick={() => go(d.title)}
                className="group block overflow-hidden rounded-xl bg-card text-left text-card-foreground transition-shadow hover:shadow-xl"
              >
                <div className="relative aspect-square bg-muted">
                  <Image
                    alt={d.imageAlt}
                    w={400}
                    h={400}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground">
                    {d.discount}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 font-medium text-card-foreground">
                    {d.title}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {d.subtitle}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-card-foreground">
                      {d.price}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {d.was}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
