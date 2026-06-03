import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CrmPricing — centered 3-tier pricing table for a CRM / SaaS landing page on a
 * subtle muted band. A heading + supporting paragraph above a responsive 3-up
 * grid of plan cards: name, blurb, large price + unit, a checklist of included
 * features (green checks) plus optional crossed-out excluded features, and a
 * full-width CTA; the featured plan inverts to a filled primary surface with a
 * floating "Most Popular" badge. CTAs route through useNavigate. Use to present
 * tiered subscription pricing for CRM, sales-pipeline or B2B SaaS products.
 * Renders fully with no props.
 */
export const CrmPricing = defineComponent({
  name: "CrmPricing",
  description:
    "Centered 3-tier pricing table for a CRM / SaaS landing page on a subtle muted band: a heading + supporting paragraph above a responsive 3-up grid of plan cards with name, blurb, large price + unit, a checklist of included features (green checks) plus optional crossed-out excluded features, and a full-width CTA; the featured plan inverts to a filled primary surface with a floating Most-Popular badge. CTAs route through useNavigate. Use to present tiered subscription pricing for CRM, sales-pipeline or B2B SaaS products.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plans; mark one featured for the highlighted column. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          excluded: z.array(z.string()).optional(),
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
      "No hidden fees. Start free, upgrade when you're ready. Annual plans save 20%."
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: "Starter",
            description: "For individuals and small teams getting started.",
            price: "$19",
            unit: "/user/month",
            features: [
              "Up to 1,000 contacts",
              "Visual pipeline",
              "Basic reporting",
              "Email integration",
            ],
            excluded: ["API access"],
            cta: "Start free trial",
          },
          {
            name: "Professional",
            description:
              "For growing teams that need automation and insights.",
            price: "$49",
            unit: "/user/month",
            features: [
              "Unlimited contacts",
              "Custom pipeline stages",
              "Workflow automation",
              "Advanced analytics",
              "API access + webhooks",
            ],
            cta: "Start free trial",
            featured: true,
          },
          {
            name: "Enterprise",
            description: "For large organizations with custom needs.",
            price: "$99",
            unit: "/user/month",
            features: [
              "Everything in Professional",
              "SSO & advanced security",
              "Dedicated account manager",
              "Custom integrations",
              "SLA guarantee",
            ],
            cta: "Contact sales",
          },
        ]

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const XIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )

    return (
      <section
        className={cn("bg-muted/50 py-20 lg:py-32", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-xl p-8 shadow-sm",
                  plan.featured
                    ? "border border-primary bg-primary text-primary-foreground shadow-xl"
                    : "border border-border bg-card",
                )}
              >
                {plan.featured ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-background px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
                      Most Popular
                    </span>
                  </div>
                ) : null}
                <h3
                  className={cn(
                    "mb-2 text-xl font-semibold",
                    plan.featured
                      ? "text-primary-foreground"
                      : "text-card-foreground",
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "mb-6",
                    plan.featured
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground",
                  )}
                >
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span
                    className={cn(
                      "text-4xl font-bold",
                      plan.featured
                        ? "text-primary-foreground"
                        : "text-card-foreground",
                    )}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={cn(
                      plan.featured
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground",
                    )}
                  >
                    {plan.unit}
                  </span>
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          "mt-0.5 size-5 shrink-0",
                          plan.featured
                            ? "text-primary-foreground/80"
                            : "text-chart-2",
                        )}
                      />
                      <span
                        className={cn(
                          plan.featured
                            ? "text-primary-foreground/90"
                            : "text-foreground/80",
                        )}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                  {(plan.excluded ?? []).map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <XIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground/50" />
                      <span className="text-muted-foreground/60">{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(plan.cta)}
                  className={cn(
                    "w-full rounded-lg py-3 font-semibold transition-colors",
                    plan.featured
                      ? "bg-background text-foreground hover:bg-muted"
                      : "border border-border text-foreground hover:bg-muted",
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
