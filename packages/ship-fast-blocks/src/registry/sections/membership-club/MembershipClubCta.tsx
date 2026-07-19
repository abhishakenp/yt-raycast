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
 * MembershipClubCta — full-width primary-surface conversion CTA for a private
 * membership club / exclusive community page. A centered narrow column on the
 * inverted primary surface: a thin display heading, a relaxed supporting line,
 * dual rounded-pill CTAs (solid light primary + outlined secondary) and a small
 * contact footnote (with email) below. CTAs route through section-kit route links. Use as the
 * closing "Ready to join" band for members clubs, professional networks, founders
 * communities, mastermind groups or paid community subscriptions. Renders fully
 * with no props.
 */
export const MembershipClubCta = defineCapsule({
  name: 'MembershipClubCta',
  description:
    "Full-width primary-surface conversion CTA for a private membership club / exclusive community page: a centered narrow column on the inverted primary surface with a thin display heading, a relaxed supporting line, dual rounded-pill CTAs (solid light primary + outlined secondary) and a small contact footnote (with email) below. CTAs route through section-kit route links. Use as the closing 'Ready to join' band for members clubs, professional networks, founders communities, mastermind groups or paid community subscriptions.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    /** Contact email surfaced in the footnote. */
    email: z.string().optional(),
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to join us?'
    const description =
      props.description ??
      "Applications are reviewed on a rolling basis. We keep membership intentionally small to preserve the quality of connections. Join 487 members who've found their people."
    const primaryCta = props.primaryCta ?? 'Apply for Membership'
    const secondaryCta = props.secondaryCta ?? 'Contact Us'
    const email = props.email ?? 'hello@theguild.club'
    const footnote =
      props.footnote ??
      `Questions? Email us at ${email} — we reply within 24 hours.`

    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>{footnote}</CtaBandEyebrow>
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
