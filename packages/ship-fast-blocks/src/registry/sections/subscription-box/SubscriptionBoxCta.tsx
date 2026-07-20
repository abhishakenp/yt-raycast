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
 * SubscriptionBoxCta — closing conversion band for a subscription-box brand
 * built on the shared CtaBand composite, restyled as the page's one inverted
 * bg-foreground/text-background moment with a slanted clip-path seam on its top
 * edge and a giant ghost "JOY" watermark. A mono eyebrow, an extrabold "Start
 * your subscription" title, supporting copy, and two squared routable actions
 * (a chunky light primary "Build your box" with a hard offset shadow and press
 * feedback + an outlined "See plans"). Theme-token only and renders complete
 * with no props. Use as the final push on any curated-box or membership page.
 */
export const SubscriptionBoxCta = defineCapsule({
  name: 'SubscriptionBoxCta',
  description:
    "Closing conversion band for a subscription-box brand built on the shared CtaBand composite, restyled as the page's one inverted bg-foreground/text-background moment with a slanted clip-path seam and a giant ghost 'JOY' watermark: a mono eyebrow, an extrabold 'Start your subscription' title, supporting copy, and two squared routable actions (a chunky light primary 'Build your box' with a hard offset shadow and press feedback + an outlined 'See plans'). Use as the final push on any curated-box or membership page.",
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Ready when you are'
    const title = props.title ?? 'Start your subscription'
    const subtitle =
      props.subtitle ??
      'Build your first box in minutes. Free shipping, skip or cancel anytime — the joy is just a click away.'
    const primaryCta = props.primaryCta ?? 'Build your box'
    const secondaryCta = props.secondaryCta ?? 'See plans'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-right-6 bottom-0 text-[7rem] text-background/[0.06] sm:text-[12rem] lg:text-[16rem]">
          JOY
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-3xl pt-24 md:pt-28"
        >
          <CtaBandEyebrow className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-background/60 opacity-100">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-4xl font-extrabold tracking-tight md:text-5xl">
            {title}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/75 opacity-100">
            {subtitle}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-2">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none border-2 border-background bg-background px-7 py-3 font-bold text-foreground shadow-[5px_5px_0_0] shadow-background/40 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-none motion-reduce:transform-none"
            >
              <NavbarRouteLink href={'Pricing'}>{primaryCta}</NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-2 border-background/50 bg-transparent px-7 py-3 font-bold text-background transition-colors duration-150 hover:bg-background/10"
            >
              <NavbarRouteLink href={'Pricing'}>{secondaryCta}</NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
