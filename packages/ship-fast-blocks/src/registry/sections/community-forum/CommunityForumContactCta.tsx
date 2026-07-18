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
 * CommunityForumContactCta — final dark call-to-action band for a community-platform /
 * discussion-forum landing page. A centered section on a dark foreground background with a
 * large heading, supporting paragraph, dual CTAs (filled primary + outlined secondary), and
 * a trust note beneath. All CTAs route through useNavigate. Use as the closing conversion band
 * for community platforms, SaaS products, or subscription services.
 */
export const CommunityForumContactCta = defineCapsule({
  name: 'CommunityForumContactCta',
  description:
    'Final dark call-to-action band for a community-platform / discussion-forum landing page: a centered section on a dark foreground background with a large heading, a supporting paragraph, dual CTAs (filled primary + outlined secondary), and a trust note beneath. All CTAs route through useNavigate. Use as the closing conversion band for community platforms, SaaS products, or subscription services.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Trust note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to build your community?'
    const description =
      props.description ??
      "Join thousands of communities already fostering meaningful conversations on Threadloom. Start free, upgrade when you're ready."
    const primaryCta = props.primaryCta ?? 'Create Free Community'
    const secondaryCta = props.secondaryCta ?? 'Schedule a Demo'
    const note =
      props.note ??
      'Free 14-day trial on all paid plans • No credit card required'

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
