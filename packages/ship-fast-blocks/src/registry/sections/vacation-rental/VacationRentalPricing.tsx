import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { PricingGrid } from "#/section-kit/PricingGrid.tsx"

/**
 * VacationRentalPricing — a stay-rate table for a vacation-rental listing page.
 * Thin configuration over the shared `PricingGrid` composite: an optional
 * heading/subheading above three rate cards (Nightly / Weekly / Monthly), each
 * with a price, a period, an included-perks list, and a "Reserve" CTA that routes
 * through useNavigate. The Weekly tier is highlighted as the best value. Theme-
 * token only. Use to present the rates of a vacation rental, beach house, cabin,
 * villa, or boutique short-stay. Renders fully with no props via baked-in
 * defaults.
 */
export const VacationRentalPricing = defineComponent({
  name: "VacationRentalPricing",
  description:
    "Stay-rate table for a vacation-rental listing page built on the shared PricingGrid composite: an optional heading/subheading above three rate cards (Nightly / Weekly / Monthly), each with a price, a period, an included-perks list, and a Reserve CTA that routes through useNavigate. The Weekly tier is highlighted as the best value. Theme-token only. Use to present the rates of a vacation rental, beach house, cabin, villa, or boutique short-stay.",
  props: z.object({
    /** Section heading above the rate cards. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Rate tiers: name, price, period, perks, CTA, and highlight flag. */
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
            name: "Nightly",
            price: "$320",
            period: "/ night",
            features: [
              "2-night minimum stay",
              "Daily housekeeping add-on",
              "Self check-in with smart lock",
              "Welcome basket on arrival",
            ],
            cta: "Reserve",
            ctaTarget: "Book Now",
          },
          {
            name: "Weekly",
            price: "$1,890",
            period: "/ week",
            features: [
              "Save 15% vs. nightly rate",
              "Mid-stay refresh clean included",
              "Late checkout when available",
              "Concierge experience planning",
            ],
            cta: "Reserve",
            ctaTarget: "Book Now",
            highlighted: true,
          },
          {
            name: "Monthly",
            price: "$6,400",
            period: "/ month",
            features: [
              "Save 30% for extended stays",
              "Weekly housekeeping included",
              "Dedicated workspace & fiber wifi",
              "Flexible arrival & departure",
            ],
            cta: "Reserve",
            ctaTarget: "Book Now",
          },
        ]

    return (
      <PricingGrid
        heading={props.heading ?? "Stay your way"}
        subheading={
          props.subheading ??
          "Flexible rates for a weekend escape, a full week by the water, or a long, slow month away."
        }
        tiers={tiers}
        className={props.className}
      />
    )
  },
})
