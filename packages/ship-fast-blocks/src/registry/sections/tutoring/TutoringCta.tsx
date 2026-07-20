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
export const TutoringCta = defineCapsule({
  name: 'TutoringCta',
  description:
    "Warm editorial-academic closing call-to-action band for tutoring sites, composing the CtaBand kit composite on a primary-toned surface with a giant serif ghost 'A+' watermark and hairline rule accents. Renders a mono uppercase eyebrow about a satisfaction guarantee, an inviting serif 'Book your first session' title and subtitle, and two sharp-cornered routed actions — a hard-offset-shadow inverted primary 'Book your first session' and a bracketed outline 'Talk to us', both with press feedback. Accepts public props to override the copy and CTA targets. Use it as the final conversion band of a tutoring page to gently nudge undecided families to take the first step.",
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow =
      props.eyebrow ?? 'First session 100% satisfaction guaranteed'
    const title = props.title ?? 'Book your first session'
    const subtitle =
      props.subtitle ??
      "Try us risk-free. If your first session isn't a great fit, it's on us — no questions asked. Let's help your learner thrive."
    return (
      <CtaBand
        tone="primary"
        className={
          'relative overflow-hidden' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 right-0 select-none font-serif text-[12rem] leading-none text-primary-foreground/10 sm:text-[18rem]"
        >
          A+
        </span>
        <CtaBandInner align="center" className="relative">
          <CtaBandEyebrow className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] opacity-80 before:h-px before:w-6 before:bg-current before:content-[''] after:h-px after:w-6 after:bg-current after:content-['']">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="font-serif text-3xl font-semibold tracking-tight md:text-5xl">
            {title}
          </CtaBandTitle>
          <CtaBandSubtitle>{subtitle}</CtaBandSubtitle>
          <CtaBandActions align="center" className="mt-2">
            <CtaAction
              variant="primary"
              invert
              asChild
              className="rounded-none px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] shadow-[6px_6px_0_0] shadow-background/25 transition-[transform,box-shadow,background-color] duration-150 active:translate-y-px active:shadow-none"
            >
              <NavbarRouteLink href={props.primaryTarget ?? 'Contact'}>
                {props.primaryCta ?? 'Book your first session'}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="gap-2 rounded-none border-primary-foreground/40 bg-transparent px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-primary-foreground transition-colors duration-150 hover:bg-primary-foreground/10 active:translate-y-px"
            >
              <NavbarRouteLink href={props.secondaryTarget ?? 'Contact'}>
                <span aria-hidden="true">[</span>
                {props.secondaryCta ?? 'Talk to us'}
                <span aria-hidden="true">]</span>
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
