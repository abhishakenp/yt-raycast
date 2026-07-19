import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * YogaStudioCta — free-trial call-to-action band for a yoga-studio page. Thin
 * configuration over the shared `CtaBand` composite at `tone="primary"`: a
 * headline, a short supporting line, and dual routable pill CTAs — a filled
 * "Start Free Trial" button (variant "primary", auto-inverted to a light pill on
 * the primary band) plus an outlined "Contact" button. Both CTAs route through
 * section-kit route links. Use as a closing conversion band inviting visitors to begin a
 * trial or reach out. Renders fully with no props via baked-in defaults.
 */
export const YogaStudioCta = defineCapsule({
  name: 'YogaStudioCta',
  description:
    "Free-trial call-to-action band for a yoga-studio page built on the shared CtaBand composite at tone='primary': a headline, a short supporting line, and dual pill CTAs (filled 'Start Free Trial' + outlined 'Contact'). Both route through section-kit route links. Use as a closing conversion band inviting visitors to begin a trial or reach out.",
  props: z.object({
    /** Headline. */
    heading: z.string().optional(),
    /** Supporting line beneath the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
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
    const heading = props.heading ?? 'Your first week is on us'
    const subheading =
      props.subheading ??
      'Start a free trial and move through a full week of classes — no card, no pressure.'
    const primaryCta = props.primaryCta ?? 'Start Free Trial'
    const primaryTarget = props.primaryTarget ?? 'Trial'
    const secondaryCta = props.secondaryCta ?? 'Contact'
    const secondaryTarget = props.secondaryTarget ?? 'Contact'

    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandTitle>{heading}</CtaBandTitle>
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
