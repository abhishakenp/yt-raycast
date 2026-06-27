import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * OnlineCourseCta — a bold, centered enrollment band for an online-course page.
 * Thin configuration over the shared CtaBand composite at tone="primary": a
 * reassurance eyebrow ("30-day money-back guarantee"), a strong "Enroll now"
 * headline, a short supporting subheading, and a centered row of two routable
 * pill CTAs — a high-contrast "Enroll now" button (target "Pricing") plus an
 * outlined "View curriculum" button. Both actions navigate through the kit's
 * useNavigate so neither is a dead link. Use near the bottom of an e-learning,
 * bootcamp, or academy landing page to drive enrollments. Renders fully with no
 * props.
 */
export const OnlineCourseCta = defineCapsule({
  name: 'OnlineCourseCta',
  description:
    "Bold, centered enrollment band for an online-course page built on the shared CtaBand composite at tone='primary': a reassurance eyebrow ('30-day money-back guarantee'), a strong 'Enroll now' headline, a short supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Enroll now' button targeting Pricing plus an outlined 'View curriculum' button). Both CTAs route through useNavigate. Use near the bottom of an e-learning, bootcamp, or academy landing page to drive enrollments.",
  props: z.object({
    /** Reassurance line shown as the band eyebrow. */
    eyebrow: z.string().optional(),
    /** Enrollment headline (maps to CtaBand title). */
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
    const eyebrow = props.eyebrow ?? '30-day money-back guarantee'
    const headline = props.headline ?? 'Enroll now'
    const subheading =
      props.subheading ??
      "Join thousands of learners building real skills. Start today — if it's not for you, get a full refund within 30 days."
    const primaryCta = props.primaryCta ?? 'Enroll now'
    const primaryTarget = props.primaryTarget ?? 'Pricing'
    const secondaryCta = props.secondaryCta ?? 'View curriculum'
    const secondaryTarget = props.secondaryTarget ?? 'Courses'

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
