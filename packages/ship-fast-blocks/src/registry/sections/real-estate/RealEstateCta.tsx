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
 * RealEstateCta — editorial closing call-to-action band for a luxury brokerage.
 * A hairline-bordered muted band, left-aligned with a mono eyebrow rail, a large
 * serif headline, a supporting line, and dual sharp-cornered CTAs (filled "Find
 * Your Home" + hairline-outline "Talk to an Agent", both with press feedback),
 * over a giant faint serif ghost watermark. Both CTAs route through section-kit
 * route links. Use to convert near the bottom of a real-estate brokerage or
 * agent page. Renders fully with no props via baked-in defaults.
 */
export const RealEstateCta = defineCapsule({
  name: 'RealEstateCta',
  description:
    "Editorial closing call-to-action band for a luxury brokerage: a hairline-bordered muted band, left-aligned with a mono eyebrow rail, a large serif headline, a supporting line, and dual sharp-cornered CTAs (filled 'Find Your Home' + hairline-outline 'Talk to an Agent') with press feedback, over a giant faint serif ghost watermark. Both CTAs route through section-kit route links. Use to convert near the bottom of a real-estate brokerage or agent page.",
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Large serif headline. */
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
    return (
      <CtaBand
        tone="primary"
        className={`relative overflow-hidden border-y border-border bg-muted/40 text-foreground ${props.className ?? ''}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-14 -right-6 select-none font-serif italic leading-none text-foreground/[0.05] text-[10rem] sm:text-[15rem]"
        >
          Home
        </span>
        <CtaBandInner align="left" className="relative max-w-6xl">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="size-1.5 shrink-0 bg-primary" />
            <CtaBandEyebrow className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground opacity-100">
              {props.eyebrow ?? "Let's get started"}
            </CtaBandEyebrow>
          </div>
          <CtaBandTitle className="max-w-2xl font-serif text-3xl font-medium tracking-tight text-foreground md:text-5xl">
            {props.heading ?? 'Ready to find your home?'}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-xl text-muted-foreground opacity-100">
            {props.subheading ??
              "Tell us what you're looking for and we'll match you with an agent who knows the area — no pressure, no obligation."}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-2">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none px-7 py-3.5 transition-[background-color,transform] duration-150 active:translate-y-px"
            >
              <NavbarRouteLink href={props.primaryTarget ?? 'Buy'}>
                {props.primaryCta ?? 'Find Your Home'}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none px-7 py-3.5 transition-[background-color,transform] duration-150 active:translate-y-px"
            >
              <NavbarRouteLink href={props.secondaryTarget ?? 'Agents'}>
                {props.secondaryCta ?? 'Talk to an Agent'}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
