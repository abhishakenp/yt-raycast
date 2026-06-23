import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { CtaBand } from "#/section-kit/CtaBand.tsx"

/**
 * SaasCta — a full-width conversion band for the bottom of a SaaS / AI-product
 * landing page. Thin configuration over the shared `CtaBand` composite at
 * tone="primary": a centered headline + supporting line over a primary surface,
 * a high-contrast "Start free trial" pill (auto-inverted on the primary band),
 * an outlined "Book demo" pill, and a small reassurance note carried in the
 * eyebrow. Both CTAs route through useNavigate. Use as the closing
 * call-to-action for SaaS, API, or B2B product pages. Renders fully with no
 * props via baked-in defaults.
 */
export const SaasCta = defineComponent({
  name: "SaasCta",
  description:
    "Full-width conversion band for the bottom of a SaaS / AI-product landing page built on the shared CtaBand composite at tone='primary': a centered headline + supporting line over a primary surface, a high-contrast 'Start free trial' pill (auto-inverted on the primary band), an outlined 'Book demo' pill, and a small reassurance note in the eyebrow. Both CTAs route through useNavigate. Use as the closing call-to-action for SaaS, API, or B2B product pages.",
  props: z.object({
    /** Centered headline on the band. */
    heading: z.string().optional(),
    /** Supporting line under the headline. */
    subheading: z.string().optional(),
    /** Primary contrast CTA label. */
    primaryCta: z.string().optional(),
    /** Optional outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Small reassurance note shown as the band eyebrow. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Ready to reclaim your day?"
    const subheading =
      props.subheading ??
      "Join 12,000+ professionals who let Chronos AI handle the scheduling. Get started in under two minutes — no setup, no hassle."
    const primaryCta = props.primaryCta ?? "Start free trial"
    const secondaryCta = props.secondaryCta ?? "Book demo"
    const note = props.note ?? "No credit card required • 14-day free trial"

    const actions = [
      { label: primaryCta, target: primaryCta, variant: "primary" as const },
      ...(secondaryCta
        ? [
            {
              label: secondaryCta,
              target: secondaryCta,
              variant: "outline" as const,
            },
          ]
        : []),
    ]

    return (
      <CtaBand
        tone="primary"
        eyebrow={note}
        title={heading}
        subtitle={subheading}
        actions={actions}
        className={props.className}
      />
    )
  },
})
