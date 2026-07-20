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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * CommunityForumContactCta — inverted playful-geometric closing band for a
 * community-platform / discussion-forum landing page. A bg-foreground /
 * text-background band that cuts in on a slanted clip-path seam (opposite
 * direction to the stats band), left-aligned: the trust note as a rounded-full
 * mono sticker chip tilted a hair, a giant tight-tracked heading, a supporting
 * paragraph, and dual CTAs — a rounded-full primary pill with a hard offset
 * shadow and an outlined rounded-full pill, both with press feedback — over a
 * giant ghost "→" watermark and an aria-hidden avatar-cluster of overlapping
 * rounded-full rings. All CTAs route through section-kit route links. Use as
 * the closing conversion band for community platforms, SaaS products, or
 * subscription services.
 */
export const CommunityForumContactCta = defineCapsule({
  name: 'CommunityForumContactCta',
  description:
    'Inverted playful-geometric closing band for a community-platform / discussion-forum landing page: a bg-foreground/text-background band cutting in on a slanted clip-path seam, left-aligned with the trust note as a tilted rounded-full mono sticker chip, a giant tight-tracked heading, a supporting paragraph, and dual rounded-full CTAs (primary pill with hard offset shadow + outlined pill, press feedback), over a giant ghost "→" watermark and an aria-hidden overlapping avatar-cluster. All CTAs route through section-kit route links. Use as the closing conversion band for community platforms, SaaS products, or subscription services.',
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
    const heading = props.heading ?? 'Ready to build your community?'
    const description =
      props.description ??
      "Join thousands of communities already fostering meaningful conversations on Threadloom. Start free, upgrade when you're ready."
    const primaryCta = props.primaryCta ?? 'Create Free Community'
    const secondaryCta = props.secondaryCta ?? 'Schedule a Demo'
    const note =
      props.note ??
      'Free 14-day trial on all paid plans • No credit card required'
    const clusterTints = [
      'bg-chart-1',
      'bg-chart-2',
      'bg-chart-4',
      'bg-primary',
      'bg-background/40',
    ]

    return (
      <CtaBand
        tone="primary"
        className={`relative overflow-hidden bg-foreground pt-10 text-background [clip-path:polygon(0_0,100%_2.5rem,100%_100%,0_100%)] sm:pt-12 ${props.className ?? ''}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 bottom-0 select-none font-extrabold leading-none tracking-tighter text-background/[0.06] text-[10rem] sm:text-[14rem] lg:text-[18rem]"
        >
          →
        </span>
        <CtaBandInner
          align="left"
          className="relative max-w-6xl gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <CtaBandEyebrow className="inline-flex w-fit -rotate-1 items-center rounded-full border-2 border-background/25 bg-background/5 px-3.5 py-1.5 font-mono text-[10px] normal-case tracking-[0.14em] uppercase text-background/80 opacity-100 shadow-[3px_3px_0_0] shadow-primary/30 sm:text-[11px]">
            {note}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-3xl text-4xl font-extrabold leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/70">
            {description}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-2 w-full gap-3 sm:gap-4">
            <CtaAction
              variant="primary"
              className="w-full rounded-full bg-background px-8 py-3.5 text-base font-semibold text-foreground shadow-[4px_4px_0_0] shadow-primary/50 transition-all duration-150 hover:-translate-y-0.5 hover:bg-background/90 active:translate-y-px active:shadow-none sm:w-auto"
              asChild
            >
              <NavbarRouteLink href={primaryCta}>{primaryCta}</NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              className="w-full rounded-full border-2 border-background/30 bg-transparent px-8 py-3.5 text-base font-semibold text-background transition-all duration-150 hover:border-background/60 hover:bg-background/10 hover:text-background active:translate-y-px sm:w-auto"
              asChild
            >
              <NavbarRouteLink href={secondaryCta}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
          <span aria-hidden="true" className="mt-4 flex items-center gap-3">
            <span className="flex -space-x-2">
              {clusterTints.map((tint, i) => (
                <span
                  key={i}
                  className={`size-7 rounded-full border-2 border-foreground ${tint}`}
                />
              ))}
            </span>
            <span className="h-px w-16 bg-background/20 sm:w-24" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
              [ join in ]
            </span>
          </span>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
