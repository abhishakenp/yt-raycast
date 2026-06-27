import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * VideoStreamingCta — a bold, centered free-trial band for a video-streaming
 * home page. Thin configuration over the shared `CtaBand` composite at
 * tone="primary": a "No commitment · Cancel anytime" eyebrow, a strong "Start
 * your free trial" headline, a short supporting subheading, and a centered row
 * of two routable pill CTAs — a high-contrast "Start Free Trial" button plus an
 * outlined "See all plans" button. Both actions route through useNavigate. Use
 * near the bottom of a streaming-service or OTT page to drive signups. Renders
 * fully with no props via baked-in defaults.
 */
export const VideoStreamingCta = defineCapsule({
  name: 'VideoStreamingCta',
  description:
    "Bold, centered free-trial band for a video-streaming home page built on the shared CtaBand composite at tone='primary': a 'No commitment · Cancel anytime' eyebrow, a strong 'Start your free trial' headline, a short supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Start Free Trial' button plus an outlined 'See all plans' button). Both CTAs route through useNavigate. Use near the bottom of a streaming-service or OTT page to drive signups.",
  props: z.object({
    /** Reassurance eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Free-trial headline (maps to CtaBand title). */
    headline: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'No commitment · Cancel anytime'
    const headline = props.headline ?? 'Start your free trial'
    const subheading =
      props.subheading ??
      "Stream thousands of shows and movies ad-free for 30 days. Pick a plan when you're ready, or cancel before it ends — your call."
    const primaryCta = props.primaryCta ?? 'Start Free Trial'
    const primaryTarget = props.primaryTarget ?? 'Pricing'
    const secondaryCta = props.secondaryCta ?? 'See all plans'
    const secondaryTarget = props.secondaryTarget ?? 'Pricing'

    return (
      <CtaBand
        tone="primary"
        eyebrow={eyebrow}
        title={headline}
        subtitle={subheading}
        actions={[
          { label: primaryCta, target: primaryTarget, variant: 'primary' },
          { label: secondaryCta, target: secondaryTarget, variant: 'outline' },
        ]}
        className={props.className}
      />
    )
  },
})
