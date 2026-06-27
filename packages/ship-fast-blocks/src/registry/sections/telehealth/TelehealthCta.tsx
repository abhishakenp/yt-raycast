import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

export const TelehealthCta = defineCapsule({
  name: 'TelehealthCta',
  description:
    "Full-width closing call-to-action band for a telehealth site, built on the shared CtaBand composite with a primary tone. Centers an optional eyebrow, a reassuring title ('Talk to a doctor now'), a supporting subtitle, and a row of routable pill actions — a primary 'Get Started' button (auto-inverted to read against the primary background) that routes to booking, plus an outlined 'Learn more' button. Use as the final conversion band near the footer of a telehealth page.",
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
    const eyebrow = props.eyebrow ?? 'Ready when you are'
    const headline = props.headline ?? 'Talk to a doctor now'
    const subheading =
      props.subheading ??
      'Skip the waiting room. Connect with a board-certified provider over secure video in minutes.'
    const primaryCta = props.primaryCta ?? 'Get Started'
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const secondaryTarget = props.secondaryTarget ?? 'How it works'

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
