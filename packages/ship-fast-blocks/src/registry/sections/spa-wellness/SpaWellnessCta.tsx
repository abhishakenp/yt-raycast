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
 * SpaWellnessCta — warm booking call-to-action band for a day-spa / wellness
 * page. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: a serif headline, a short supporting line, and dual routable
 * pill CTAs — a filled "Book Now" button (variant "primary", auto-inverted to a
 * light pill on the primary band) plus an outlined "Call" button. Both CTAs
 * route through section-kit route links. Use as a closing conversion band inviting visitors
 * to reserve a treatment or call the spa. Renders fully with no props via
 * baked-in defaults.
 */
export const SpaWellnessCta = defineCapsule({
  name: 'SpaWellnessCta',
  description:
    "Warm booking call-to-action band for a day-spa / wellness page built on the shared CtaBand composite at tone='primary': a serif headline, a short supporting line, and dual pill CTAs (filled 'Book Now' + outlined 'Call'). Both route through section-kit route links. Use as a closing conversion band inviting visitors to reserve a treatment or call the spa.",
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
    const heading = props.heading ?? 'Your moment of calm is waiting'
    const subheading =
      props.subheading ??
      "Reserve a treatment today and give yourself the rest you've earned."
    const primaryCta = props.primaryCta ?? 'Book Now'
    const primaryTarget = props.primaryTarget ?? 'Booking'
    const secondaryCta = props.secondaryCta ?? 'Call'
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
