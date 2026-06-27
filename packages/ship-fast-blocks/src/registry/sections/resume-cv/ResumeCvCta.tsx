import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * ResumeCvCta — a focused closing call-to-action band for a personal resume /
 * CV / portfolio site. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: an availability eyebrow, a warm "Let's work together"
 * headline, a short supporting subheading, and a centered row of two routable
 * pill CTAs — a high-contrast "Get in Touch" button (variant "primary",
 * auto-inverted to a light pill on the primary band) plus an outlined "Download
 * CV" button (variant "outline"). Both actions navigate through the kit's
 * useNavigate so neither is a dead link. Use near the bottom of a personal
 * portfolio, online résumé, or professional profile page to drive contact and
 * CV downloads. Renders fully with no props via baked-in defaults.
 */
export const ResumeCvCta = defineCapsule({
  name: 'ResumeCvCta',
  description:
    "Focused closing call-to-action band for a personal resume / CV / portfolio site: a full-width primary-colored band with an availability eyebrow, a warm 'Let's work together' headline, a short supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Get in Touch' button plus an outlined 'Download CV' button). Both CTAs route through useNavigate. Use near the bottom of a personal portfolio, online résumé, or professional profile page to drive contact and CV downloads.",
  props: z.object({
    /** Availability line shown as the band eyebrow. */
    eyebrow: z.string().optional(),
    /** Call-to-action headline (maps to CtaBand title). */
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
    const eyebrow = props.eyebrow ?? 'Available for work'
    const headline = props.headline ?? "Let's work together"
    const subheading =
      props.subheading ??
      "I'm currently open to new opportunities and freelance collaborations. Tell me about your project and let's build something thoughtful."
    const primaryCta = props.primaryCta ?? 'Get in Touch'
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'Download CV'
    const secondaryTarget = props.secondaryTarget ?? 'CV'

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
