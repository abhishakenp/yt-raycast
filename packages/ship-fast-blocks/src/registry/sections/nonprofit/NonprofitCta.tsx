import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * NonprofitCta — a warm, centered donation band for a nonprofit / charity / NGO
 * page. Thin configuration over the shared `CtaBand` composite at
 * tone="primary": an eyebrow, a strong appeal headline, a short supporting line,
 * and a centered row of two routable pill CTAs — a high-contrast "Donate Today"
 * button (variant "primary", auto-inverted to a light pill on the primary band)
 * plus an outlined "Become a Volunteer" button. Both actions navigate through
 * useNavigate so neither is a dead link. Use near the bottom of a nonprofit,
 * foundation, or humanitarian page to drive donations and sign-ups. Renders
 * fully with no props via baked-in "Roots of Hope" defaults.
 */
export const NonprofitCta = defineCapsule({
  name: 'NonprofitCta',
  description:
    "Warm, centered donation band for a nonprofit / charity / NGO page built on the shared CtaBand composite at tone='primary': an eyebrow, a strong appeal headline, a short supporting line, and a centered row of two routable pill CTAs — a high-contrast 'Donate Today' button plus an outlined 'Become a Volunteer' button. Both CTAs route through useNavigate. Use near the bottom of a nonprofit, foundation, or humanitarian page to drive donations and volunteer sign-ups.",
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Appeal headline (maps to CtaBand title). */
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
    const eyebrow = props.eyebrow ?? 'Be the reason'
    const headline = props.headline ?? 'Your gift changes a life today'
    const subheading =
      props.subheading ??
      'Every dollar goes further than you think. Give once or give monthly — and watch hope take root in a community that needs it.'
    const primaryCta = props.primaryCta ?? 'Donate Today'
    const primaryTarget = props.primaryTarget ?? 'Donate'
    const secondaryCta = props.secondaryCta ?? 'Become a Volunteer'
    const secondaryTarget = props.secondaryTarget ?? 'Volunteer'

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
