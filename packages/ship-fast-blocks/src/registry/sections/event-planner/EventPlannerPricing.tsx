import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * EventPlannerPricing — three-tier planning-packages block on a muted band. A
 * centered intro (uppercase eyebrow, thin light heading, lede) above a 3-up grid
 * of rounded package cards; the "popular" tier is filled with the primary color
 * and lifted with a shadow plus a corner ribbon, while the others are plain cards.
 * Each card shows name, tagline, large light price, a check-marked feature list,
 * and a full-width pill CTA routed through useNavigate. Use to present tiered
 * pricing for event/wedding planners or premium service businesses.
 */
export const EventPlannerPricing = defineComponent({
  name: "EventPlannerPricing",
  description:
    "Three-tier planning-packages block on a muted band: a centered intro (uppercase eyebrow, thin light heading, lede) above a 3-up grid of rounded package cards; the 'popular' tier is filled with the primary color and lifted with a shadow plus a corner ribbon, while the others are plain cards. Each card shows name, tagline, large light price, a check-marked feature list, and a full-width pill CTA routed through useNavigate. Use to present tiered pricing (e.g. Essential, Signature, White Glove) for event/wedding planners or premium service businesses.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    popularLabel: z.string().optional(),
    cta: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          features: z.array(z.string()),
          popular: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const pricingEyebrow = props.eyebrow ?? "Investment"
    const pricingHeading = props.heading ?? "Planning Packages"
    const pricingDesc =
      props.description ??
      "Transparent pricing for weddings and celebrations. Custom quotes available for corporate and destination events."
    const pricingPopular = props.popularLabel ?? "Most Popular"
    const pricingCta = props.cta ?? "Inquire"
    const pricingTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: "Essential",
            tagline: "Day-of coordination",
            price: "$2,500",
            features: [
              "One month of pre-event support",
              "Day-of timeline creation",
              "Vendor coordination",
              "On-site management (10 hours)",
              "Setup and breakdown oversight",
            ],
          },
          {
            name: "Signature",
            tagline: "Partial planning",
            price: "$5,500",
            popular: true,
            features: [
              "Everything in Essential, plus:",
              "Six months of planning support",
              "Vendor recommendations & referrals",
              "Design concept & mood board",
              "Two venue walkthroughs",
              "Rehearsal coordination",
            ],
          },
          {
            name: "White Glove",
            tagline: "Full-service planning",
            price: "$12,000",
            features: [
              "Everything in Signature, plus:",
              "Full planning from day one",
              "Unlimited vendor meetings",
              "Custom design & décor sourcing",
              "Guest management & RSVP tracking",
              "Dedicated lead planner + assistant",
            ],
          },
        ]

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    return (
      <section
        className={cn(
          "bg-muted px-4 py-20 sm:px-6 lg:px-8 lg:py-32",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {pricingEyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
              {pricingHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{pricingDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {pricingTiers.map((tier) => (
              <article
                key={tier.name}
                className={cn(
                  "relative rounded-2xl p-8 lg:p-10",
                  tier.popular ? "bg-primary shadow-xl" : "bg-card shadow-sm",
                )}
              >
                {tier.popular && (
                  <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-2xl bg-muted px-3 py-1 text-xs font-medium text-foreground">
                    {pricingPopular}
                  </div>
                )}
                <h3
                  className={cn(
                    "mb-2 text-xl font-medium",
                    tier.popular
                      ? "text-primary-foreground"
                      : "text-card-foreground",
                  )}
                >
                  {tier.name}
                </h3>
                <p
                  className={cn(
                    "mb-6",
                    tier.popular
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground",
                  )}
                >
                  {tier.tagline}
                </p>
                <p
                  className={cn(
                    "mb-8 text-4xl font-light",
                    tier.popular
                      ? "text-primary-foreground"
                      : "text-card-foreground",
                  )}
                >
                  {tier.price}
                </p>
                <ul className="mb-8 space-y-4">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          "mt-0.5 size-5 shrink-0",
                          tier.popular
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      />
                      <span
                        className={cn(
                          tier.popular
                            ? "text-primary-foreground/90"
                            : "text-muted-foreground",
                        )}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(`${pricingCta} ${tier.name}`)}
                  className={cn(
                    "block w-full rounded-full px-6 py-3 text-center font-medium transition-colors",
                    tier.popular
                      ? "bg-background text-foreground hover:bg-muted"
                      : "border border-border text-foreground hover:bg-muted",
                  )}
                >
                  {pricingCta}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
