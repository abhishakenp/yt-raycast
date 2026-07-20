import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
 * NonprofitCta — the warm closing donation band for a nonprofit / charity / NGO
 * page, and the page's single accent moment. Built on the shared `CtaBand`
 * composite at tone="primary" but restyled to a soft muted wash behind a giant
 * faint ghost watermark: a mono micro-label eyebrow, a serif appeal headline, a
 * short supporting line, and a centered row of two square routable CTAs — one
 * high-contrast filled-primary "Donate Today" button (the one place primary
 * lives) with press feedback, beside a square hairline outline "Become a
 * Volunteer" button. Both actions navigate through section-kit route links so
 * neither is a dead link. Warm, human, trustworthy. Use near the bottom of a
 * nonprofit, foundation, or humanitarian page to drive donations and sign-ups.
 * Renders fully with no props via baked-in "Roots of Hope" defaults.
 */
export const NonprofitCta = defineCapsule({
  name: 'NonprofitCta',
  description:
    "Warm closing donation band for a nonprofit / charity / NGO page — the page's single accent moment — built on the shared CtaBand composite at tone='primary' but restyled to a soft muted wash behind a giant faint ghost watermark: a mono micro-label eyebrow, a serif appeal headline, a short supporting line, and a centered row of two square routable CTAs — one high-contrast filled-primary 'Donate Today' button (the one place primary lives) with press feedback, beside a square hairline outline 'Become a Volunteer' button. Both CTAs route through section-kit route links. Warm, human, trustworthy. Use near the bottom of a nonprofit, foundation, or humanitarian page to drive donations and volunteer sign-ups.",
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Appeal headline (maps to CtaBand title). */
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
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Be the reason'
    const headline = props.headline ?? 'Your gift changes a life today'
    const subheading =
      props.subheading ??
      'Every dollar goes further than you think. Give once or give monthly — and watch hope take root in a community that needs it.'
    const primaryCta = props.primaryCta ?? 'Donate Today'
    const primaryTarget = props.primaryTarget ?? 'Donate'
    const secondaryCta = props.secondaryCta ?? 'Become a Volunteer'
    const secondaryTarget = props.secondaryTarget ?? 'Volunteer'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden border-y border-border bg-muted/50 text-foreground',
          props.className,
        )}
      >
        <Watermark className="-bottom-20 -right-6 select-none font-serif text-[11rem] italic text-foreground/[0.04] sm:text-[18rem]">
          give
        </Watermark>
        <CtaBandInner className="relative items-center gap-6 pb-20 pt-20 text-center sm:pb-24 sm:pt-24">
          <CtaBandEyebrow className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground opacity-100">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-3xl font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-[1.05] tracking-tight text-foreground">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-base leading-relaxed text-muted-foreground opacity-100 md:text-lg">
            {subheading}
          </CtaBandSubtitle>
          <CtaBandActions className="mt-2 w-full flex-col sm:w-auto sm:flex-row">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none px-8 py-4 text-base font-semibold transition-colors active:translate-y-px"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-foreground/25 px-8 py-4 text-base font-semibold transition-colors active:translate-y-px"
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
