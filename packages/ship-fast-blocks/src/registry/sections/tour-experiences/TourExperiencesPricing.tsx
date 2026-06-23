import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { PricingGrid } from "#/section-kit/PricingGrid.tsx"

/**
 * TourExperiencesPricing — tour-package pricing for an adventure / guided-tour
 * brand. Composes the shared PricingGrid composite as three per-person packages
 * (Half-Day Escape, Full-Day Expedition, Multi-Day Expedition) each with a price,
 * "/ person" period, an inclusions list, and a "Book Now" CTA that routes via the
 * shared navigation. The Full-Day tier is highlighted as the most popular pick.
 * Use to present bookable tour tiers on tour-operator, expedition, and
 * travel-experience landing pages. Renders fully with no props via baked-in
 * defaults.
 */
export const TourExperiencesPricing = defineComponent({
  name: "TourExperiencesPricing",
  description:
    "Tour-package pricing for an adventure / guided-tour brand. Composes the shared PricingGrid composite as three per-person packages (Half-Day Escape, Full-Day Expedition, Multi-Day Expedition) each with a price, '/ person' period, an inclusions list, and a 'Book Now' CTA routed via the shared navigation. The Full-Day tier is highlighted as the most popular pick. Use to present bookable tour tiers on tour-operator, expedition, and travel-experience landing pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Tour packages (name, price, period, features, cta). */
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
            name: "Half-Day Escape",
            price: "$89",
            period: "/ person",
            features: [
              "3-hour guided tour",
              "Small group (max 8)",
              "Local guide & insider stops",
              "Hotel pickup nearby",
            ],
            cta: "Book Now",
            ctaTarget: "Book a Tour",
          },
          {
            name: "Full-Day Expedition",
            price: "$159",
            period: "/ person",
            features: [
              "Full-day guided adventure",
              "Small group (max 8)",
              "Lunch & local tastings included",
              "All entry fees & gear",
              "Door-to-door transport",
            ],
            cta: "Book Now",
            ctaTarget: "Book a Tour",
            highlighted: true,
          },
          {
            name: "Multi-Day Expedition",
            price: "$640",
            period: "/ person",
            features: [
              "3-day guided expedition",
              "Boutique stays each night",
              "All meals & tastings",
              "Private guide & support crew",
              "Curated off-the-map routes",
            ],
            cta: "Book Now",
            ctaTarget: "Book a Tour",
          },
        ]

    return (
      <section className="bg-background px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <PricingGrid
            heading={props.heading ?? "Pick your pace, book your seat"}
            subheading={
              props.subheading ??
              "Transparent per-person pricing with everything you need included. No hidden fees, just unforgettable days out."
            }
            tiers={tiers}
            className={props.className}
          />
        </div>
      </section>
    )
  },
})
