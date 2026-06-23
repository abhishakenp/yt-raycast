import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { PricingGrid } from "#/section-kit/PricingGrid.tsx"

/**
 * SaasPricing — a 3-tier pricing band for a B2B SaaS landing page. Thin
 * configuration over the shared `PricingGrid` composite: a centered heading +
 * intro above a responsive 3-column grid of plan cards (name, big price +
 * period, checkmark feature bullets, and a CTA button). The highlighted tier
 * gets a primary border, shadow, and a floating "Most popular" pill, and every
 * CTA routes through useNavigate. Use to present subscription tiers for SaaS
 * products, apps, or online services. Renders fully with no props via baked-in
 * defaults.
 */
export const SaasPricing = defineComponent({
  name: "SaasPricing",
  description:
    "A 3-tier pricing band for a B2B SaaS landing page built on the shared PricingGrid composite: a centered heading + intro above a responsive 3-column grid of plan cards (name, big price + period, checkmark feature bullets, and a CTA button). The highlighted tier gets a primary border, shadow, and a floating 'Most popular' pill, and every CTA routes through useNavigate. Use to present subscription tiers for SaaS products, apps, or online services.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Pricing tiers; mark one with highlighted to feature it. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Pricing that scales with you"
    const subheading =
      props.subheading ??
      "Start free and upgrade when you're ready. No hidden fees, cancel anytime."
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: "Starter",
            price: "$0",
            period: "/mo",
            features: [
              "Up to 3 projects",
              "Community support",
              "Basic analytics",
              "1 team member",
            ],
            cta: "Get started",
            highlighted: false,
          },
          {
            name: "Pro",
            price: "$29",
            period: "/mo",
            features: [
              "Unlimited projects",
              "Priority email support",
              "Advanced analytics",
              "Up to 10 team members",
              "Custom integrations",
            ],
            cta: "Start free trial",
            highlighted: true,
          },
          {
            name: "Enterprise",
            price: "Custom",
            features: [
              "Everything in Pro",
              "Dedicated success manager",
              "SSO & audit logs",
              "Unlimited team members",
              "99.9% uptime SLA",
            ],
            cta: "Contact sales",
            highlighted: false,
          },
        ]

    return (
      <PricingGrid
        heading={heading}
        subheading={subheading}
        tiers={tiers.map((t) => ({
          name: t.name,
          price: t.price,
          period: t.period,
          features: t.features,
          cta: t.cta,
          ctaTarget: t.cta,
          highlighted: t.highlighted,
        }))}
        className={props.className}
      />
    )
  },
})
