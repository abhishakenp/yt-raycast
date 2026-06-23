import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { PricingGrid } from "#/section-kit/PricingGrid.tsx"

const DEFAULT_TIERS: {
  name: string
  price: string
  period?: string
  features?: string[]
  cta?: string
  ctaTarget?: string
  highlighted?: boolean
}[] = [
  {
    name: "Single Session",
    price: "$45",
    period: "/session",
    features: [
      "One 60-minute 1-on-1 session",
      "Matched to your subject & goals",
      "Session summary for parents",
      "No commitment — try us out",
    ],
    cta: "Book now",
    ctaTarget: "Contact",
  },
  {
    name: "10-Session Pack",
    price: "$399",
    period: "/pack",
    features: [
      "Ten 60-minute sessions",
      "Save $51 vs. single sessions",
      "Same trusted tutor each week",
      "Progress tracking & check-ins",
      "Flexible rescheduling",
    ],
    cta: "Get started",
    ctaTarget: "Contact",
    highlighted: true,
  },
  {
    name: "Monthly Unlimited",
    price: "$299",
    period: "/month",
    features: [
      "Unlimited weekly sessions",
      "Priority tutor matching",
      "Test-prep & homework support",
      "Monthly progress report",
    ],
    cta: "Get started",
    ctaTarget: "Contact",
  },
]

export const TutoringPricing = defineComponent({
  name: "TutoringPricing",
  description:
    "Transparent pricing band for tutoring sites, composing the PricingGrid kit composite into per-session and package tiers. Renders a Single Session pay-as-you-go option, a highlighted 10-Session Pack marked as most popular, and a Monthly Unlimited plan — each with a friendly feature list and a routed 'Book now' / 'Get started' CTA. Accepts a public `tiers` prop to override the plans. Use it to give parents clear, no-surprises options and reduce sticker shock.",
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
    const heading = props.heading ?? "Simple, friendly pricing"
    const subheading =
      props.subheading ??
      "Pay as you go or save with a package — whatever fits your family. No hidden fees, ever."
    const tiers = props.tiers?.length ? props.tiers : DEFAULT_TIERS

    return (
      <section className={"bg-background py-20 sm:py-24" + (props.className ? " " + props.className : "")}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PricingGrid heading={heading} subheading={subheading} tiers={tiers} />
        </div>
      </section>
    )
  },
})
