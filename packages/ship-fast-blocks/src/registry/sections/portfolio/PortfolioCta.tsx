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
 * PortfolioCta — inverted collaboration band with a slanted clip-path seam for
 * an editorial-personal portfolio. Built on the shared `CtaBand` composite but
 * flooded to an inverted `bg-foreground text-background` band whose top edge is
 * cut on a diagonal seam (neighbor-independent) and carries a giant faint ghost
 * mark: a mono availability eyebrow, a giant clamp extrabold headline, a short
 * supporting subheading, and a left-anchored row of two rounded-none CTAs — a
 * high-contrast light "Let's work together" button with a hard offset shadow +
 * press feedback beside a hairline-outlined "View Work" button. Both actions
 * route through section-kit route links so neither is a dead link. Use near the
 * bottom of a designer, motion artist, or director personal site to drive
 * project inquiries. Renders fully with no props via baked-in defaults.
 */
export const PortfolioCta = defineCapsule({
  name: 'PortfolioCta',
  description:
    "Inverted collaboration band with a slanted clip-path seam for an editorial-personal portfolio, built on the shared CtaBand composite but flooded to an inverted bg-foreground text-background band whose top edge is cut on a diagonal seam and carries a giant faint ghost mark: a mono availability eyebrow, a giant clamp extrabold headline, a short supporting subheading, and a left-anchored row of two rounded-none CTAs (a high-contrast light 'Let's work together' button with a hard offset shadow + press feedback beside a hairline-outlined 'View Work' button). Both CTAs route through section-kit route links. Use near the bottom of a designer, motion artist, or director personal site to drive project inquiries.",
  props: z.object({
    /** Collaboration headline (maps to CtaBand title). */
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
    /** Availability line shown as the band eyebrow. */
    availability: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const headline = props.headline ?? 'Have a project in mind?'
    const subheading =
      props.subheading ??
      "I take on a handful of collaborations each quarter. Tell me about your idea and let's build something worth remembering."
    const primaryCta = props.primaryCta ?? "Let's work together"
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'View Work'
    const secondaryTarget = props.secondaryTarget ?? 'Work'
    const availability = props.availability ?? 'Available for new projects'

    return (
      <CtaBand
        tone="primary"
        className="relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-6 select-none font-extrabold leading-none tracking-tighter text-background/[0.06] text-[9rem] sm:text-[15rem]"
        >
          &amp;
        </span>
        <CtaBandInner
          align="left"
          className="relative max-w-[1200px] px-6 pt-28 pb-20 lg:px-8"
        >
          <CtaBandEyebrow className="inline-flex items-center gap-2 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-background/70">
            <span aria-hidden="true" className="size-1.5 bg-background/70" />
            {availability}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-3xl text-[clamp(2.2rem,5.5vw,4rem)] font-extrabold leading-[0.98] tracking-tighter text-balance">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-xl text-background/75">
            {subheading}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-4">
            <CtaAction
              variant="primary"
              invert
              asChild
              className="rounded-none border-2 border-background px-7 py-3.5 font-semibold shadow-[5px_5px_0_0] shadow-background/20 transition-all duration-100 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-2 border-background/40 bg-transparent px-7 py-3.5 font-semibold text-background transition-all duration-100 hover:-translate-y-0.5 hover:bg-background/10 hover:text-background active:translate-x-[2px] active:translate-y-[2px]"
            >
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
