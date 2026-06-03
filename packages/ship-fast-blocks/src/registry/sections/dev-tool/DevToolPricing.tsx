import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * DevToolPricing — a 3-tier pricing table for a developer tool / API platform.
 * A muted-banded section with a centered heading + intro above a responsive
 * 3-column grid of plan cards (name, tagline, big price + period, a checklist of
 * features with brand checkmarks, and a CTA button). The featured tier gets a
 * brand-colored border, shadow, and a floating "Most Popular" pill. Every CTA
 * routes through useNavigate. Use to present subscription tiers for developer
 * tools, API platforms, backend-as-a-service, or technical SaaS.
 */
export const DevToolPricing = defineComponent({
  name: "DevToolPricing",
  description:
    "3-tier pricing table for a developer tool / API platform: a muted-banded section with a centered heading + intro above a responsive 3-column grid of plan cards (name, tagline, big price + period, a checklist of features with brand checkmarks, and a CTA button). The featured tier gets a brand-colored border, shadow, and a floating 'Most Popular' pill. Every CTA routes through useNavigate. Use to present subscription tiers for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    popularLabel: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Simple, transparent pricing"
    const description =
      props.description ??
      "Start free, scale as you grow. No hidden fees, no surprises."
    const popularLabel = props.popularLabel ?? "Most Popular"
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: "Starter",
            tagline: "For side projects and learning",
            price: "$0",
            period: "/month",
            features: [
              "10,000 API requests/month",
              "1 GB storage",
              "Community support",
              "3 team members",
            ],
            cta: "Get Started",
            featured: false,
          },
          {
            name: "Pro",
            tagline: "For production applications",
            price: "$29",
            period: "/month",
            features: [
              "500,000 API requests/month",
              "50 GB storage",
              "Priority email support",
              "15 team members",
              "Custom domains & SSL",
            ],
            cta: "Start Free Trial",
            featured: true,
          },
          {
            name: "Enterprise",
            tagline: "For large-scale teams",
            price: "Custom",
            features: [
              "Unlimited API requests",
              "Unlimited storage",
              "24/7 phone & Slack support",
              "Unlimited team members",
              "SSO, audit logs, SLAs",
            ],
            cta: "Contact Sales",
            featured: false,
          },
        ]

    const Check = () => (
      <svg
        className="mt-0.5 size-5 flex-shrink-0 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="5 13 9 17 19 7" />
      </svg>
    )

    return (
      <section
        className={cn("bg-muted/40 py-20 lg:py-28", props.className)}
        aria-labelledby="pricing-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="pricing-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <article
                key={tier.name}
                className={cn(
                  "relative rounded-2xl bg-background p-6 lg:p-8",
                  tier.featured
                    ? "border-2 border-primary shadow-lg"
                    : "border border-border",
                )}
              >
                {tier.featured ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {popularLabel}
                    </span>
                  </div>
                ) : null}
                <div className="mb-6">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tier.tagline}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  {tier.period ? (
                    <span className="text-muted-foreground">
                      {tier.period}
                    </span>
                  ) : null}
                </div>
                <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <Check />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(tier.cta)}
                  className={cn(
                    "block w-full rounded-lg px-4 py-2.5 text-center font-medium transition-colors",
                    tier.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-input text-foreground hover:bg-muted",
                  )}
                >
                  {tier.cta}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
