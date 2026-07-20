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
 * TelehealthCta — calm clinical + warmth closing call-to-action band for a
 * telehealth site, built on the shared CtaBand composite with a primary tone and
 * cut in on a gentle slanted clip-path seam. On the primary band, behind a giant
 * faint ghost "+" watermark: a mono eyebrow, a reassuring extrabold title
 * ('Talk to a doctor now'), a supporting subtitle, and a row of square routable
 * pill actions — a filled background-on-primary "Get Started" button (with press
 * feedback) that routes to booking, plus a hairline outline "Learn more" button.
 * Precise yet warm, telemedicine aesthetic. Use as the final conversion band
 * near the footer of a telehealth page.
 */
export const TelehealthCta = defineCapsule({
  name: 'TelehealthCta',
  description:
    "Calm clinical + warmth closing call-to-action band for a telehealth site, built on the shared CtaBand composite with a primary tone and cut in on a gentle slanted clip-path seam: on the primary band, behind a giant faint ghost '+' watermark, a mono eyebrow, a reassuring extrabold title ('Talk to a doctor now'), a supporting subtitle, and a row of square routable pill actions — a filled background-on-primary 'Get Started' button (with press feedback) that routes to booking, plus a hairline outline 'Learn more' button. Precise yet warm, telemedicine aesthetic. Use as the final conversion band near the footer of a telehealth page.",
  props: z.object({
    eyebrow: z.string().optional(),
    headline: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Ready when you are'
    const headline = props.headline ?? 'Talk to a doctor now'
    const subheading =
      props.subheading ??
      'Skip the waiting room. Connect with a board-certified provider over secure video in minutes.'
    const primaryCta = props.primaryCta ?? 'Get Started'
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const secondaryTarget = props.secondaryTarget ?? 'How it works'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-right-8 -top-16 text-[16rem] text-primary-foreground/[0.06] sm:text-[22rem]">
          +
        </Watermark>
        <CtaBandInner className="relative gap-6 pb-16 pt-20 sm:pb-20 sm:pt-24">
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70 opacity-100">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-3xl text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-tight">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-primary-foreground/80 opacity-100">
            {subheading}
          </CtaBandSubtitle>
          <CtaBandActions className="mt-2">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-background/90 active:translate-y-px"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-primary-foreground/40 bg-transparent px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 active:translate-y-px"
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
