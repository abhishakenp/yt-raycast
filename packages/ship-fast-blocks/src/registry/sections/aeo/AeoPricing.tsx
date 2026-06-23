import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { PricingGrid } from "#/section-kit/PricingGrid.tsx"

/**
 * AeoPricing — three-tier pricing for an Answer-Engine-Optimization (AEO) SaaS.
 * Thin configuration over the shared PricingGrid composite: a centered heading
 * block above Starter, Growth (highlighted as "Most popular"), and Enterprise
 * tiers, each with a monthly price, a feature list, and a routable CTA. Use to
 * convert prospects on AEO, generative-search visibility, or brand-citation
 * analytics pages. Renders fully with no props via baked-in defaults.
 */
export const AeoPricing = defineComponent({
  name: "AeoPricing",
  description:
    "Three-tier pricing for an Answer-Engine-Optimization (AEO) product built on the shared PricingGrid composite: a centered heading block above Starter, Growth (highlighted as 'Most popular'), and Enterprise tiers, each with a monthly price/period, a feature list, and a routable CTA. Use to convert prospects on AEO, generative-search visibility, or brand-citation analytics landing pages.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.string().optional(),
          ctaTarget: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: "Starter",
            price: "$49",
            period: "/mo",
            features: [
              "1 brand, 50 tracked prompts",
              "ChatGPT & Perplexity tracking",
              "Weekly citation reports",
              "Core optimization recommendations",
            ],
            cta: "Start Free",
            ctaTarget: "Start Free",
          },
          {
            name: "Growth",
            price: "$199",
            period: "/mo",
            features: [
              "3 brands, 500 tracked prompts",
              "All answer engines incl. AI Overviews",
              "Share-of-voice & competitor tracking",
              "Change alerts & prompt opportunities",
              "Priority support",
            ],
            cta: "Start Free",
            ctaTarget: "Start Free",
            highlighted: true,
          },
          {
            name: "Enterprise",
            price: "Custom",
            features: [
              "Unlimited brands & prompts",
              "API access & data exports",
              "Dedicated strategist & SSO",
              "Custom integrations & SLAs",
              "Executive reporting",
            ],
            cta: "Book demo",
            ctaTarget: "Book demo",
          },
        ]

    return (
      <section className={"bg-background py-20 lg:py-28" + (props.className ? " " + props.className : "")}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PricingGrid
            heading={props.heading ?? "Pricing that scales with your AI visibility"}
            subheading={
              props.subheading ??
              "Start free, then upgrade as you track more prompts, brands, and answer engines. No setup fees."
            }
            tiers={tiers}
          />
        </div>
      </section>
    )
  },
})
