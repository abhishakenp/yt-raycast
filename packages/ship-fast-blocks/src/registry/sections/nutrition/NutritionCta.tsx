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
 * NutritionCta — fresh clean-editorial closing conversion band for a
 * nutrition-coaching or wellness site, built on the shared CtaBand kit
 * composite. A full-width inverted bg-foreground / text-background band cut with
 * a slanted clip-path seam and carrying a giant ghost duplicate of the headline
 * as a watermark: a mono eyebrow, a bold "Start your plan" title, a motivating
 * lede, and a row of two sharp-cornered routable actions (filled light chip with
 * a hard offset shadow + press feedback, and a hairline outline). All props are
 * optional with baked defaults so it renders standalone. Use as the closing
 * conversion band on nutrition coaches, registered dietitians, meal-plan
 * subscriptions, diet / wellness programs or healthy-eating apps.
 */
export const NutritionCta = defineCapsule({
  name: 'NutritionCta',
  description:
    "Fresh clean-editorial closing conversion band for a nutrition-coaching or wellness site, built on the shared CtaBand kit composite: a full-width inverted bg-foreground / text-background band cut with a slanted clip-path seam and carrying a giant ghost duplicate of the headline as a watermark, with a mono eyebrow, a bold 'Start your plan' title, a motivating lede, and a row of two sharp-cornered routable actions (filled light chip with a hard offset shadow + press feedback, and a hairline outline). Use as the closing conversion band on nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs or healthy-eating apps.",
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
    const eyebrow = props.eyebrow ?? 'Your fresh start'
    const headline = props.headline ?? 'Start your plan'
    const subheading =
      props.subheading ??
      'Join 50,000+ people eating better without dieting. Get your personalized plan in minutes—cancel anytime.'
    const primaryCta = props.primaryCta ?? 'Start Now'
    const primaryTarget = props.primaryTarget ?? 'Pricing'
    const secondaryCta = props.secondaryCta ?? 'See Plans'
    const secondaryTarget = props.secondaryTarget ?? 'Plans'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-bottom-8 left-1/2 -translate-x-1/2 text-[6rem] text-background/[0.06] sm:text-[9rem] lg:text-[13rem]">
          {headline}
        </Watermark>
        <CtaBandInner className="relative items-start pt-24 text-left lg:pt-28">
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/70 opacity-100">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-3xl font-extrabold tracking-tight text-background sm:text-4xl lg:text-5xl">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/70">
            {subheading}
          </CtaBandSubtitle>
          <CtaBandActions className="mt-2 justify-start">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-background px-7 py-3.5 text-base font-semibold text-foreground shadow-[6px_6px_0_0] shadow-background/25 transition-[transform,box-shadow,background-color] duration-150 hover:bg-background/90 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transform-none"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border border-background/40 bg-transparent px-7 py-3.5 text-base font-semibold text-background transition-colors duration-150 hover:bg-background/10 active:translate-y-px"
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
