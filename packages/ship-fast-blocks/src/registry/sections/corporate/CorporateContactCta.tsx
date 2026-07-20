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
 * CorporateContactCta — Swiss-corporate ink-inverted conversion band for an
 * enterprise / corporate B2B site. A full inversion band (foreground
 * background, background text) cutting in on a slanted clip-path seam
 * (opposite direction to the stats band), with a giant ghost arrow watermark.
 * Left-aligned asymmetric composition: a mono rule row (primary index square +
 * response-time note), a giant clamped headline, a lede, and dual square-edged
 * CTAs with press feedback — the filled one flipping to the light surface for
 * contrast. Every CTA routes through section-kit route links. Use as a
 * pre-footer conversion block on enterprise SaaS, consultancy, and managed
 * services landing pages.
 */
export const CorporateContactCta = defineCapsule({
  name: 'CorporateContactCta',
  description:
    'Swiss-corporate ink-inverted conversion band for an enterprise / corporate B2B site: a full inversion band with a slanted clip-path top seam and a giant ghost arrow watermark, composed left-aligned — a mono rule row (primary index square + response-time note), a giant clamped headline, a lede, and dual square-edged CTAs with press feedback (the filled one flipping to the light surface). CTAs route through section-kit route links. Use as a pre-footer conversion block on enterprise SaaS, consultancy, and managed services landing pages.',
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
        className={`relative overflow-hidden bg-foreground pt-12 text-background [clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)] ${props.className ?? ''}`}
      >
        <Watermark className="-bottom-10 -right-4 text-[11rem] text-background/[0.05] sm:text-[16rem]">
          &rarr;
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        >
          <CtaBandEyebrow className="flex w-full items-center gap-3 border-b border-background/20 pb-4 font-mono text-[11px] normal-case tracking-[0.2em] text-background/50 opacity-100">
            <span aria-hidden="true" className="size-2 shrink-0 bg-primary" />
            {note}
          </CtaBandEyebrow>
          <CtaBandTitle className="mt-4 max-w-3xl text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-tight">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/60 opacity-100">
            {description}
          </CtaBandSubtitle>
          <CtaBandActions
            align="left"
            className="mt-2 grid w-full grid-cols-1 gap-3 sm:flex"
          >
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-background px-7 py-3.5 text-base text-foreground transition-all duration-150 hover:bg-background/90 active:translate-y-px"
            >
              <NavbarRouteLink href={primaryCta}>{primaryCta}</NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-background/30 bg-transparent px-7 py-3.5 text-base text-background transition-all duration-150 hover:bg-background/10 active:translate-y-px"
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
