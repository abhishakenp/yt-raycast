import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { PricingGrid } from "#/section-kit/PricingGrid.tsx"

/**
 * SubscriptionBoxPricing — pricing band for a subscription-box brand built on
 * the shared PricingGrid composite. A padded section wraps three monthly box
 * tiers (Mini, Classic — highlighted, Deluxe), each with a per-month price, a
 * feature list, and a routable CTA. Theme-token only and renders complete with
 * no props. Use to present box plans on any curated-box or membership page.
 */
export const SubscriptionBoxPricing = defineComponent({
  name: "SubscriptionBoxPricing",
  description:
    "Pricing band for a subscription-box brand built on the shared PricingGrid composite: a padded section wrapping three monthly box tiers (Mini, Classic highlighted, Deluxe) with per-month prices, feature lists, and routable CTAs. Use to present box plans on any curated-box or membership page.",
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
    const heading = props.heading ?? "Pick your box"
    const subheading =
      props.subheading ??
      "One simple monthly price. Free shipping, skip or cancel anytime."
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: "Mini",
            price: "$19",
            period: "/mo",
            features: [
              "3–4 curated items",
              "Monthly delivery",
              "Free shipping",
              "Skip anytime",
            ],
            cta: "Start Mini",
            ctaTarget: "Pricing",
          },
          {
            name: "Classic",
            price: "$39",
            period: "/mo",
            features: [
              "6–8 curated items",
              "Personalized to your taste",
              "Free shipping",
              "Skip or cancel anytime",
              "Member-only extras",
            ],
            cta: "Start Classic",
            ctaTarget: "Pricing",
            highlighted: true,
          },
          {
            name: "Deluxe",
            price: "$69",
            period: "/mo",
            features: [
              "10+ premium items",
              "Full personalization",
              "Free priority shipping",
              "Early access drops",
              "Surprise bonus gifts",
            ],
            cta: "Start Deluxe",
            ctaTarget: "Pricing",
          },
        ]

    return (
      <section
        className={cn(
          "bg-background py-20 text-foreground sm:py-24",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6">
          <PricingGrid
            heading={heading}
            subheading={subheading}
            tiers={tiers}
          />
        </div>
      </section>
    )
  },
})
