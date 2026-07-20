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
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const TravelAgencyCta = defineCapsule({
  name: 'TravelAgencyCta',
  description:
    "Editorial-wanderlust closing call-to-action band for the Travel Agency page family. Composes the shared CtaBand kit composite on a muted surface with a giant ghost watermark: a mono eyebrow over a hairline rule, an oversized heading, supporting copy, and dual sharp-cornered route-link actions (a solid primary 'Plan a Trip' action and a hairline-outline 'Talk to an advisor' action, both with press feedback). Use as the final conversion band before the footer. All copy and actions are prop-driven with wanderlust-themed defaults so it renders with no props.",
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    primaryLabel: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryLabel: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const title = props.title ?? 'Start planning your trip'
    return (
      <CtaBand
        tone="muted"
        className={`relative overflow-hidden ${props.className ?? ''}`}
      >
        <CtaBandInner className="relative max-w-3xl px-6 py-24 lg:py-32">
          <Watermark className="-bottom-[0.14em] left-1/2 -translate-x-1/2 text-[24vw]">
            {title.split(' ')[0]}
          </Watermark>
          <CtaBandEyebrow className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground opacity-100">
            {props.eyebrow ?? 'Your next adventure awaits'}
          </CtaBandEyebrow>
          <div aria-hidden="true" className="h-px w-16 bg-border" />
          <CtaBandTitle className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {title}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-muted-foreground">
            {props.subtitle ??
              "Tell us where you're dreaming of going and we'll craft a journey tailored just for you — no obligation, no pressure."}
          </CtaBandSubtitle>
          <CtaBandActions className="mt-2">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-primary px-8 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px"
            >
              <NavbarRouteLink href={props.primaryTarget ?? 'Plan a Trip'}>
                {props.primaryLabel ?? 'Plan a Trip'}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border border-foreground bg-transparent px-8 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground transition-[background-color,color,transform] duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
            >
              <NavbarRouteLink href={props.secondaryTarget ?? 'Contact'}>
                {props.secondaryLabel ?? 'Talk to an advisor'}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
