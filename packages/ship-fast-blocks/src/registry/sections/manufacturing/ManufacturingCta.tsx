import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ManufacturingCta — a dark closing call-to-action band for a precision-
 * manufacturing site. On a foreground-colored, centered block: a large heading,
 * a supporting paragraph, dual CTAs (a solid background-on-foreground button plus
 * an outlined button) and a small note line beneath. Both CTAs route through
 * useNavigate. Bold, industrial, conversion-focused. Use as the final
 * conversion prompt before the footer on machine-shop, fabricator or contract-
 * manufacturer pages. Renders fully with no props via baked-in defaults.
 */
export const ManufacturingCta = defineCapsule({
  name: 'ManufacturingCta',
  description:
    'A dark closing call-to-action band for a precision-manufacturing site: on a foreground-colored centered block, a large heading, a supporting paragraph, dual CTAs (a solid background-on-foreground button plus an outlined button) and a small note line beneath. Both CTAs route through useNavigate. Bold, industrial, conversion-focused. Use as the final conversion prompt before the footer on machine-shop, fabricator or contract-manufacturer pages.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to Start Your Project?'
    const description =
      props.description ??
      'Get a detailed quote within 24 hours. Our engineers review every submission for manufacturability and will suggest cost-saving alternatives when possible.'
    const primaryCta = props.primaryCta ?? 'Request a Quote'
    const secondaryCta = props.secondaryCta ?? 'Call (206) 555-1234'
    const note =
      props.note ??
      'Located in Kent, Washington • Serving customers nationwide since 1989'

    return (
      <CtaBand
        tone="primary"
        className={`bg-foreground text-background ${props.className ?? ''}`}
      >
        <CtaBandInner>
          <CtaBandEyebrow>{note}</CtaBandEyebrow>
          <CtaBandTitle>{heading}</CtaBandTitle>
          <CtaBandSubtitle>{description}</CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" onClick={() => go(primaryCta)}>
              {primaryCta}
            </CtaAction>
            <CtaAction variant="outline" onClick={() => go(secondaryCta)}>
              {secondaryCta}
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
