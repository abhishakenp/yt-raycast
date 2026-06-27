import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * WebinarCta — a bold, centered registration band for a webinar landing page.
 * Thin configuration over the shared `CtaBand` composite at `tone="primary"`:
 * a date-and-seats urgency eyebrow, a strong "Reserve your spot — free"
 * headline, a short reassuring subheading, and a centered row of two routable
 * pill CTAs — a high-contrast "Save my seat" button plus an outlined "Add to
 * calendar" button. Both actions navigate through the kit's useNavigate so
 * neither is a dead link. Use near the bottom of a webinar, summit, or virtual
 * event page to drive registrations. Renders fully with no props.
 */
export const WebinarCta = defineCapsule({
  name: 'WebinarCta',
  description:
    "Bold, centered registration band for a webinar landing page built on the shared CtaBand composite at tone='primary': a date-and-seats urgency eyebrow, a strong 'Reserve your spot — free' headline, a short reassuring subheading, and a centered row of two pill CTAs (a high-contrast 'Save my seat' button plus an outlined 'Add to calendar' button). Both CTAs route through useNavigate. Use near the bottom of a webinar, summit, or virtual-event page to drive registrations.",
  props: z.object({
    /** Urgency line shown as the band eyebrow (date + seats left). */
    eyebrow: z.string().optional(),
    /** Registration headline (maps to CtaBand title). */
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
    const eyebrow =
      props.eyebrow ?? 'July 17 · 11:00 AM PT — only 87 seats left'
    const headline = props.headline ?? 'Reserve your spot — free'
    const subheading =
      props.subheading ??
      "Register in seconds. We'll send you the join link, calendar invite, and the recording afterward."
    const primaryCta = props.primaryCta ?? 'Save my seat'
    const primaryTarget = props.primaryTarget ?? 'Register'
    const secondaryCta = props.secondaryCta ?? 'Add to calendar'
    const secondaryTarget = props.secondaryTarget ?? 'Register'

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
