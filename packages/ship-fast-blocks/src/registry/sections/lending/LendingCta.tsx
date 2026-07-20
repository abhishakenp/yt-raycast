import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * LendingCta — Swiss-fintech inverted trust band for a lending or fintech
 * marketing page. The page's one confident ink-inverted band (bg-foreground /
 * text-background) that cuts in on a slanted clip-path seam conveying
 * institutional trust, with a giant ghost "$" watermark bleeding behind a
 * left-aligned lockup: a mono meta rule with a single primary square accent, a
 * large "ready to check your rate?" title, a supporting paragraph, dual routable
 * actions (a square light primary action that inverts back to the surface with a
 * hard offset shadow + press feedback, plus a square outline phone action), and a
 * hairline mono row of check-marked security badges. All actions route through
 * section-kit route links. Use as the closing conversion push near the page
 * bottom on personal-loan, debt-consolidation, or financing pages. Renders fully
 * with no props via baked-in defaults.
 */
export const LendingCta = defineCapsule({
  name: 'LendingCta',
  description:
    "Swiss-fintech inverted trust band for a lending or fintech marketing page: the one confident ink-inverted band (bg-foreground / text-background) cut on a slanted clip-path seam conveying institutional trust, with a giant ghost '$' watermark behind a left-aligned lockup — a mono meta rule with a single primary square accent, a large 'ready to check your rate?' title, a supporting paragraph, dual routable actions (a square light primary action that inverts back to the surface with a hard offset shadow + press feedback, plus a square outline phone action), and a hairline mono row of check-marked security badges. Actions route through section-kit route links. Use as the closing conversion push near the page bottom on personal-loan, debt-consolidation, or financing pages.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primary: z.string().optional(),
    phone: z.string().optional(),
    badges: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const ctaHeading = props.heading ?? 'Ready to check your rate?'
    const ctaDesc =
      props.description ??
      "It takes 2 minutes, won't affect your credit score, and could save you thousands compared to credit cards."
    const ctaPrimary = props.primary ?? 'Check My Rate'
    const ctaPhone = props.phone ?? 'Call (800) 555-1234'
    const ctaBadges = props.badges?.length
      ? props.badges
      : ['256-bit SSL encryption', 'Bank-level security', 'No spam, ever']

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Watermark className="-bottom-16 -right-6 text-[16rem] leading-none text-background/5 sm:text-[22rem]">
          $
        </Watermark>
        <CtaBandInner align="left" className="relative max-w-3xl gap-5">
          <div className="flex items-center gap-3 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span aria-hidden="true" className="size-2 bg-primary" />
            Apply in 2 minutes
          </div>
          <CtaBandTitle className="max-w-2xl text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
            {ctaHeading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/60 opacity-100">
            {ctaDesc}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-2 gap-4">
            <CtaAction
              variant="primary"
              invert
              className="min-h-11 gap-2 rounded-none px-6 text-sm font-medium tracking-tight shadow-[5px_5px_0_0] shadow-background/25 transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
              asChild
            >
              <NavbarRouteLink href={ctaPrimary}>
                {ctaPrimary}
                <ArrowRight className="size-4" />
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              className="min-h-11 gap-2 rounded-none border-background/40 px-6 text-sm font-medium tracking-tight text-background transition-[transform,background-color] duration-150 hover:bg-background/10 active:translate-y-px motion-reduce:transform-none"
              asChild
            >
              <NavbarRouteLink href={ctaPhone}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {ctaPhone}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
          <ul className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-background/20 pt-5">
            {ctaBadges.map((badge) => (
              <li
                key={badge}
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-background/60"
              >
                <Check className="size-3.5 text-background" />
                {badge}
              </li>
            ))}
          </ul>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
