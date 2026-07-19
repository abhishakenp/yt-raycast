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
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * NonprofitCta — a warm, centered donation band for a nonprofit / charity / NGO
 * page. Thin configuration over the shared `CtaBand` composite at
 * tone="primary": an eyebrow, a strong appeal headline, a short supporting line,
 * and a centered row of two routable pill CTAs — a high-contrast "Donate Today"
 * button (variant "primary", auto-inverted to a light pill on the primary band)
 * plus an outlined "Become a Volunteer" button. Both actions navigate through
 * section-kit route links so neither is a dead link. Use near the bottom of a nonprofit,
 * foundation, or humanitarian page to drive donations and sign-ups. Renders
 * fully with no props via baked-in "Roots of Hope" defaults.
 */
export const NonprofitCta = defineCapsule({
  name: 'NonprofitCta',
  description:
    "Warm, centered donation band for a nonprofit / charity / NGO page built on the shared CtaBand composite at tone='primary': an eyebrow, a strong appeal headline, a short supporting line, and a centered row of two routable pill CTAs — a high-contrast 'Donate Today' button plus an outlined 'Become a Volunteer' button. Both CTAs route through section-kit route links. Use near the bottom of a nonprofit, foundation, or humanitarian page to drive donations and volunteer sign-ups.",
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
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>{eyebrow}</CtaBandEyebrow>
          <CtaBandTitle>{headline}</CtaBandTitle>
          <CtaBandSubtitle>{subheading}</CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" asChild>
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction variant="outline" asChild>
              <NavbarRouteLink href={secondaryTarget}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
