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
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MembershipClubCta — editorial closing conversion band for a private membership
 * club / exclusive community page. A muted band carrying a giant ghost serif
 * watermark, fronting a centered narrow column: a mono contact micro-label
 * kicker, an oversized serif display headline, a relaxed supporting line, and
 * dual square CTAs (a solid bg-foreground primary + a hairline-outline ghost,
 * both with press feedback). CTAs route through section-kit route links. Use as
 * the closing "Ready to join" band for members clubs, professional networks,
 * founders communities, mastermind groups or paid community subscriptions.
 * Renders fully with no props.
 */
export const MembershipClubCta = defineCapsule({
  name: 'MembershipClubCta',
  description:
    'Editorial closing conversion band for a private membership club / exclusive community page: a muted band carrying a giant ghost serif watermark, fronting a centered narrow column with a mono contact micro-label kicker, an oversized serif display headline, a relaxed supporting line, and dual square CTAs (a solid bg-foreground primary + a hairline-outline ghost, both with press feedback). CTAs route through section-kit route links. Use as the closing "Ready to join" band for members clubs, professional networks, founders communities, mastermind groups or paid community subscriptions.',
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
      <CtaBand
        tone="muted"
        className={`relative overflow-hidden ${props.className ?? ''}`}
      >
        <Watermark className="-right-4 bottom-[-0.15em] font-serif text-[22vw] font-normal tracking-tighter">
          Join
        </Watermark>
        <CtaBandInner className="relative gap-6 py-24 lg:py-32">
          <CtaBandEyebrow className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground opacity-100">
            {footnote}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-2xl font-serif text-4xl font-normal tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-lg leading-relaxed text-muted-foreground opacity-100">
            {description}
          </CtaBandSubtitle>
          <CtaBandActions className="mt-2 gap-3">
            <CtaAction
              variant="primary"
              className="rounded-none bg-foreground px-10 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px"
              asChild
            >
              <NavbarRouteLink href={primaryCta}>{primaryCta}</NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              className="rounded-none border border-border bg-transparent px-10 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-[border-color,color,transform] duration-150 hover:border-foreground active:translate-y-px"
              asChild
            >
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
