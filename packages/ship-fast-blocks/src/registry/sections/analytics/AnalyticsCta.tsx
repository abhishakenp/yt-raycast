import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { CtaBand } from "#/section-kit/CtaBand.tsx"

/**
 * AnalyticsCta — full-width closing call-to-action band for an analytics
 * product, built on the shared CtaBand composite with a primary tone. Centers an
 * optional eyebrow, a confident title ("See your data clearly"), a supporting
 * subtitle, and a row of routable pill actions — a primary "Start Free Trial"
 * button (auto-inverted to read against the primary background) plus an outlined
 * "Book a demo" button. Sharp and conversion-focused. Use as the final band near
 * the footer of any analytics, BI, or data-product site. Renders with no props.
 */
export const AnalyticsCta = defineComponent({
  name: "AnalyticsCta",
  description:
    "Full-width closing call-to-action band for an analytics product, built on the shared CtaBand composite with a primary tone. Centers an optional eyebrow, a confident title ('See your data clearly'), a supporting subtitle, and a row of routable pill actions — a primary 'Start Free Trial' button (auto-inverted to read against the primary background) plus an outlined 'Book a demo' button. Sharp and conversion-focused. Use as the final band near the footer of any analytics, BI, or data-product site.",
  props: z.object({
    eyebrow: z.string().optional(),
    headline: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Ready when you are"
    const headline = props.headline ?? "See your data clearly"
    const subheading =
      props.subheading ??
      "Spin up your first dashboard in minutes. No credit card, no setup calls — just answers."
    const primaryCta = props.primaryCta ?? "Start Free Trial"
    const primaryTarget = props.primaryTarget ?? "Pricing"
    const secondaryCta = props.secondaryCta ?? "Book a demo"
    const secondaryTarget = props.secondaryTarget ?? "Contact"

    return (
      <CtaBand
        tone="primary"
        eyebrow={eyebrow}
        title={headline}
        subtitle={subheading}
        actions={[
          { label: primaryCta, target: primaryTarget, variant: "primary" },
          { label: secondaryCta, target: secondaryTarget, variant: "outline" },
        ]}
        className={props.className}
      />
    )
  },
})
