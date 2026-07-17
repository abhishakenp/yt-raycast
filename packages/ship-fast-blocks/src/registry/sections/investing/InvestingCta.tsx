import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * InvestingCta — dark closing call-to-action band for an investing / fintech
 * page. A centered, dark (foreground-surface) section with a large headline, a
 * supporting paragraph, dual primary/outline CTA buttons, and a small reassurance
 * note beneath. Both CTAs route through useNavigate. Use as the final conversion
 * push before the footer on a brokerage, trading-app or robo-advisor page.
 * Renders fully with no props.
 */
export const InvestingCta = defineCapsule({
  name: 'InvestingCta',
  description:
    'Dark closing call-to-action band for an investing / fintech page: a centered dark (foreground-surface) section with a large headline, a supporting paragraph, dual primary/outline CTA buttons, and a small reassurance note beneath. Both CTAs route through useNavigate. Use as the final conversion push before the footer on a brokerage, trading-app or robo-advisor page.',
  props: z.object({
    /** Large headline. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outline secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Small reassurance note beneath the buttons. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to start investing smarter?'
    const description =
      props.description ??
      'Join over 2 million investors who have already discovered a better way to grow their wealth. Start with $0 and upgrade anytime.'
    const primaryCta = props.primaryCta ?? 'Create free account'
    const secondaryCta = props.secondaryCta ?? 'Schedule a demo'
    const note = props.note ?? 'No credit card required. Cancel anytime.'

    return (
      <CtaBand
        tone="primary"
        eyebrow={note}
        title={heading}
        subtitle={description}
        actions={[
          { label: primaryCta, target: primaryCta, variant: 'primary' },
          { label: secondaryCta, target: secondaryCta, variant: 'outline' },
        ]}
        className={`bg-foreground text-background ${props.className ?? ''}`}
      />
    )
  },
})
