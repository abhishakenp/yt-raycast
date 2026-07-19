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
 * KidsEducationCta — dark closing call-to-action band for a kids / family
 * learning platform. A full-width dark (foreground) section with soft gradient
 * wash and blurred glow orbs behind a centered headline, supporting paragraph,
 * dual rounded CTAs (filled primary with arrow + outlined play-icon secondary),
 * and a small reassurance note. Every CTA routes through section-kit route links. Use as the
 * final conversion band before the footer for kids-education startups, children's
 * e-learning platforms, tutoring services, and family learning apps. Renders
 * fully with no props via baked-in defaults.
 */
export const KidsEducationCta = defineCapsule({
  name: 'KidsEducationCta',
  description:
    "Dark closing call-to-action band for a kids / family learning platform: a full-width dark (foreground) section with soft gradient wash and blurred glow orbs behind a centered headline, supporting paragraph, dual rounded CTAs (filled primary with arrow + outlined play-icon secondary), and a small reassurance note. CTAs route through section-kit route links. Use as the final conversion band before the footer for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Section headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Reassurance note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to Start the Adventure?'
    const description =
      props.description ??
      'Join 50,000+ families who have made learning a joyful daily ritual. Start your free 14-day trial today—no credit card required.'
    const primaryCta = props.primaryCta ?? 'Start Free Trial'
    const secondaryCta = props.secondaryCta ?? 'Watch Demo'
    const note =
      props.note ?? 'Used by families in 35+ countries. Cancel anytime.'

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
            <CtaAction variant="primary" asChild>
              <NavbarRouteLink href={primaryCta}>{primaryCta}</NavbarRouteLink>
            </CtaAction>
            <CtaAction variant="outline" asChild>
              <NavbarRouteLink href={secondaryCta}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
