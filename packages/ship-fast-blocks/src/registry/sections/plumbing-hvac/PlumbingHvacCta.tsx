import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'

/**
 * PlumbingHvacCta — a full-width conversion band for the bottom of a plumbing &
 * HVAC trade site. Thin configuration over the shared `CtaBand` composite at
 * tone="primary": a centered headline + supporting line over a primary surface,
 * a high-contrast "Schedule Service" pill (auto-inverted on the primary band),
 * an outlined "Call Now" pill, and a small reassurance note carried in the
 * eyebrow. Both CTAs route through useNavigate. Use as the closing
 * call-to-action for plumber, HVAC, or other home-service pages. Renders fully
 * with no props via baked-in defaults.
 */
export const PlumbingHvacCta = defineCapsule({
  name: 'PlumbingHvacCta',
  description:
    "Full-width conversion band for the bottom of a plumbing & HVAC trade site built on the shared CtaBand composite at tone='primary': a centered headline + supporting line over a primary surface, a high-contrast 'Schedule Service' pill (auto-inverted on the primary band), an outlined 'Call Now' pill, and a small reassurance note in the eyebrow. Both CTAs route through useNavigate. Use as the closing call-to-action for plumber, HVAC, or other home-service pages.",
  props: z.object({
    /** Centered headline on the band. */
    heading: z.string().optional(),
    /** Supporting line under the headline. */
    subheading: z.string().optional(),
    /** Primary contrast CTA label. */
    primaryCta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    primaryTarget: z.string().optional(),
    /** Optional outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Navigation target for the secondary CTA. */
    secondaryTarget: z.string().optional(),
    /** Small reassurance note shown as the band eyebrow. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Schedule your service today'
    const subheading =
      props.subheading ??
      'Same-day appointments available, with 24/7 emergency service when you need it most. Licensed, insured, and ready to help.'
    const primaryCta = props.primaryCta ?? 'Schedule Service'
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'Call Now'
    const secondaryTarget = props.secondaryTarget ?? 'Contact'
    const note = props.note ?? 'Upfront pricing • Satisfaction guaranteed'

    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>{note}</CtaBandEyebrow>
          <CtaBandTitle>{heading}</CtaBandTitle>
          <CtaBandSubtitle>{subheading}</CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" onClick={() => go(primaryTarget)}>
              {primaryCta}
            </CtaAction>
            {secondaryCta && (
              <CtaAction variant="outline" onClick={() => go(secondaryTarget)}>
                {secondaryCta}
              </CtaAction>
            )}
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
