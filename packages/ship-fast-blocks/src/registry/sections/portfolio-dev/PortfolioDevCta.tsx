import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * PortfolioDevCta — a bold, centered availability band for a modern developer
 * portfolio. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: a mono-style availability eyebrow, a strong headline, a
 * short supporting subheading, and a centered row of two routable pill CTAs — a
 * high-contrast "Start a Project" button (variant "primary", auto-inverted to a
 * light pill on the primary band) plus an outlined "View Work" button (variant
 * "outline"). Both actions navigate through the kit's useNavigate so neither is
 * a dead link. Use near the bottom of a freelance engineer or studio portfolio
 * to drive contact and new engagements. Renders fully with no props via
 * baked-in defaults.
 */
export const PortfolioDevCta = defineComponent({
  name: 'PortfolioDevCta',
  description:
    "Bold, centered availability band for a modern developer portfolio: a full-width primary-colored band with a mono-style availability eyebrow, a strong headline, a short supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Start a Project' button plus an outlined 'View Work' button). Both CTAs route through useNavigate. Use near the bottom of a freelance engineer or studio portfolio to drive contact and new engagements.",
  props: z.object({
    /** Mono-style availability eyebrow. */
    eyebrow: z.string().optional(),
    /** CTA headline (maps to CtaBand title). */
    title: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subtitle: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? '// open to work'
    const title = props.title ?? "Let's build something"
    const subtitle =
      props.subtitle ??
      "Have a project in mind? I'm currently taking on new freelance and contract work."
    const primaryCta = props.primaryCta ?? 'Start a Project'
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'View Work'
    const secondaryTarget = props.secondaryTarget ?? 'Work'

    return (
      <CtaBand
        tone="primary"
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        actions={[
          { label: primaryCta, target: primaryTarget, variant: 'primary' },
          { label: secondaryCta, target: secondaryTarget, variant: 'outline' },
        ]}
        className={props.className}
      />
    )
  },
})
