import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

import { Watermark } from '#/section-kit/Decor.tsx'
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
 * InvestingCta — Swiss-fintech closing call-to-action band for an investing /
 * brokerage page. A full-width muted band framed by hairline top/bottom rules
 * with a giant ghost "$" watermark bleeding behind a left-aligned lockup: a mono
 * micro-label reassurance eyebrow, a large tracking-tight headline, a supporting
 * paragraph, and a row of routable actions — one square (binary radius) primary
 * CTA with a hard offset shadow and mechanical press feedback (the single accent
 * moment) plus a square outline secondary action. Both CTAs route through route
 * links. Use as the final conversion push before the footer on a brokerage,
 * trading-app or robo-advisor page. Renders fully with no props.
 */
export const InvestingCta = defineCapsule({
  name: 'InvestingCta',
  description:
    "Swiss-fintech closing call-to-action band for an investing / brokerage page built on the shared CtaBand composite: a full-width muted band framed by hairline rules with a giant ghost '$' watermark behind a left-aligned lockup — a mono micro-label reassurance eyebrow, a large tracking-tight headline, a supporting paragraph, and routable actions (one square primary CTA with a hard offset shadow and press feedback as the single accent, plus a square outline secondary action). Both CTAs route through route links. Use as the final conversion push before the footer on a brokerage, trading-app or robo-advisor page.",
  props: z.object({
    /** Large headline. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outline secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Small reassurance note beneath the buttons. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to start investing smarter?'
    const description =
      props.description ??
      'Join over 2 million investors who have already discovered a better way to grow their wealth. Start with $0 and upgrade anytime.'
    const primaryCta = props.primaryCta ?? 'Create free account'
    const secondaryCta = props.secondaryCta ?? 'Schedule a demo'
    const note = props.note ?? 'No credit card required. Cancel anytime.'

    return (
      <CtaBand
        tone="muted"
        className={cn(
          'relative overflow-hidden border-y border-border',
          props.className,
        )}
      >
        <Watermark className="-right-6 -bottom-16 text-[16rem] leading-none sm:text-[22rem]">
          $
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-6xl gap-5 sm:px-8 lg:px-8"
        >
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary opacity-100">
            {note}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-muted-foreground opacity-100">
            {description}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-2 gap-4">
            <CtaAction
              variant="primary"
              asChild
              className="min-h-11 rounded-none px-6 text-[13px] font-medium tracking-tight shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
            >
              <NavbarRouteLink href={primaryCta}>{primaryCta}</NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="min-h-11 rounded-none border-foreground px-6 text-[13px] font-medium tracking-tight shadow-[5px_5px_0_0] shadow-foreground/20 transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
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
