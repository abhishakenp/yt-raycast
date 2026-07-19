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
 * CorporateContactCta — dark conversion CTA band for an enterprise / corporate
 * B2B site. A full-width inverted section with a large centered headline, a lead
 * paragraph, dual pill CTAs (filled primary + bordered secondary), and a response-time
 * note beneath. Every CTA routes through section-kit route links. Use as a pre-footer conversion
 * block on enterprise SaaS, consultancy, and managed services landing pages.
 */
export const CorporateContactCta = defineCapsule({
  name: 'CorporateContactCta',
  description:
    'Dark conversion CTA band for an enterprise / corporate B2B site: full-width inverted background with a large centered headline, a lead paragraph, dual pill CTAs (filled primary + bordered secondary), and a response-time note beneath. CTAs route through section-kit route links. Use as a pre-footer conversion block on enterprise SaaS, consultancy, and managed services landing pages.',
  props: z.object({
    /** Headline text. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Primary filled CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary bordered CTA label. */
    secondaryCta: z.string().optional(),
    /** Fine-print note under the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to transform your enterprise?'
    const description =
      props.description ??
      'Join 500+ organizations that trust Nexus for mission-critical infrastructure. Schedule a personalized demo with our solutions team.'
    const primaryCta = props.primaryCta ?? 'Schedule a Demo'
    const secondaryCta = props.secondaryCta ?? 'Contact Sales'
    const note =
      props.note ?? 'Average response time: Under 2 hours during business hours'

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
