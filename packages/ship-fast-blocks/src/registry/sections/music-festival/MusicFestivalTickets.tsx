import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MusicFestivalTickets — a three-tier tickets / pricing block for a music /
 * arts festival landing page. A centered eyebrow + heading + intro, then a row
 * of three pass cards (GA, GA+, VIP) — each with a name, tagline, big price +
 * unit, a checkmarked feature list and a primary CTA; the popular tier gets a
 * primary ring and a floating "Most Popular" badge. Below, a centered add-ons
 * row of small bordered cards. Every tier CTA and add-on routes through
 * useNavigate. Use to sell passes on music festivals, arts festivals, concert
 * series, or any multi-day ticketed event.
 */
export const MusicFestivalTickets = defineComponent({
  name: "MusicFestivalTickets",
  description:
    "Three-tier tickets / pricing block for a music / arts festival landing page: a centered eyebrow + heading + intro paragraph, then a row of three pass cards (GA, GA+, VIP) — each with a name, tagline, big price + unit, a checkmarked feature list and a primary CTA, with the popular tier highlighted by a primary ring and a floating 'Most Popular' badge — followed by a centered add-ons row of small bordered cards (camping, RV, glamping). Every tier CTA and add-on routes through useNavigate. Use to sell passes on music festivals, arts festivals, concert series, camping/desert events, or any multi-day ticketed event.",
  props: z.object({
    /** Eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Intro paragraph beneath the heading. */
    description: z.string().optional(),
    /** Pricing tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          popular: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Label above the add-ons row. */
    addOnsLabel: z.string().optional(),
    /** Add-on options (name + price). */
    addOns: z
      .array(z.object({ name: z.string(), price: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "Tickets"
    const heading = props.heading ?? "Get Your Pass"
    const description =
      props.description ??
      "All passes include three-day festival access, camping, and free water refill stations. Payment plans available."
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: "General Admission",
            tagline: "Full weekend access to all stages",
            price: "$349",
            unit: "/person",
            features: [
              "All 4 stages access",
              "Car camping included",
              "Free water stations",
              "Mobile app access",
            ],
            cta: "Buy GA Pass",
          },
          {
            name: "GA+",
            tagline: "Enhanced comfort & fast entry",
            price: "$549",
            unit: "/person",
            features: [
              "Everything in GA",
              "Fast lane entry",
              "Premium air-conditioned restrooms",
              "GA+ lounge access",
              "Complimentary lockers",
            ],
            cta: "Buy GA+ Pass",
            popular: true,
            badge: "Most Popular",
          },
          {
            name: "VIP",
            tagline: "The ultimate festival experience",
            price: "$899",
            unit: "/person",
            features: [
              "Everything in GA+",
              "VIP stage viewing areas",
              "Open bars (beer, wine, cocktails)",
              "Dedicated VIP entrance",
              "Commemorative laminate & poster",
            ],
            cta: "Buy VIP Pass",
          },
        ]
    const addOnsLabel = props.addOnsLabel ?? "Add-Ons"
    const addOns = props.addOns?.length
      ? props.addOns
      : [
          { name: "Car Camping", price: "+ $75/vehicle" },
          { name: "RV Camping", price: "+ $250/spot" },
          { name: "Glamping Tent", price: "+ $599 (2-person)" },
        ]

    const Check = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-primary" aria-hidden="true">
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section className={cn("py-24 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-foreground/70">
              {description}
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "relative rounded-xl bg-card p-8 text-card-foreground",
                  tier.popular
                    ? "border-2 border-primary"
                    : "border border-border",
                )}
              >
                {tier.badge ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                    {tier.badge}
                  </span>
                ) : null}
                <h3 className="mb-2 text-xl font-semibold">{tier.name}</h3>
                <p className="mb-6 text-sm text-card-foreground/60">
                  {tier.tagline}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-card-foreground/60">{tier.unit}</span>
                </div>
                <ul className="mb-8 space-y-3 text-sm">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3">
                      <Check />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(tier.cta)}
                  className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <h3 className="mb-6 text-center text-lg font-semibold">
              {addOnsLabel}
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {addOns.map((a) => (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => go(a.name)}
                  className="rounded-lg border border-border bg-card p-4 text-center text-card-foreground transition-colors hover:border-primary/40"
                >
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-sm text-card-foreground/60">{a.price}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
