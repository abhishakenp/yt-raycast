import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { PricingGrid } from "#/section-kit/PricingGrid.tsx"

/**
 * FlightSimulatorPricing — a 3-tier editions table for a flight simulator
 * landing page. Thin configuration over the shared `PricingGrid` composite: a
 * centered heading above three edition cards (Standard, Deluxe, Premium) with a
 * one-time price, a feature list of included aircraft and airports, and a buy
 * CTA on each. The middle Deluxe tier is highlighted as the recommended pick.
 * Use to sell editions of a flight sim, airliner / combat sim, or aviation
 * title. Renders fully with no props via baked defaults.
 */
export const FlightSimulatorPricing = defineComponent({
  name: "FlightSimulatorPricing",
  description:
    "3-tier editions table for a flight-simulator landing page built on the shared PricingGrid composite: a centered heading above three edition cards (Standard, Deluxe, Premium) each with a one-time price, a feature list of included aircraft and airports, and a buy CTA. The middle Deluxe tier is highlighted as the recommended pick and every CTA routes to the buy page. Use to sell editions of a flight sim, airliner / combat sim, or aviation title.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Navigation target for every edition CTA. */
    ctaTarget: z.string().optional(),
    /** Pricing tiers: name, price, period, features, cta, highlighted. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Choose your edition"
    const ctaTarget = props.ctaTarget ?? "Buy"
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: "Standard",
            price: "$59.99",
            period: "one-time",
            features: [
              "20 hand-crafted aircraft",
              "30 detailed airports",
              "Global photoreal scenery",
              "Live real-world weather",
              "Multiplayer & shared skies",
            ],
            cta: "Buy Standard",
          },
          {
            name: "Deluxe",
            price: "$89.99",
            period: "one-time",
            features: [
              "Everything in Standard",
              "35 aircraft, incl. 5 study-level",
              "40 detailed airports",
              "Enhanced airliner systems",
              "Priority content updates",
            ],
            cta: "Buy Deluxe",
            highlighted: true,
          },
          {
            name: "Premium",
            price: "$119.99",
            period: "one-time",
            features: [
              "Everything in Deluxe",
              "50 aircraft, incl. 10 study-level",
              "50 hand-built hub airports",
              "Full VR support & hardware kit",
              "Exclusive livery & mission packs",
            ],
            cta: "Buy Premium",
          },
        ]

    const tiersWithTarget = tiers.map((t) => ({ ...t, ctaTarget }))

    return (
      <PricingGrid
        heading={heading}
        subheading={props.subheading}
        tiers={tiersWithTarget}
        className={props.className}
      />
    )
  },
})
