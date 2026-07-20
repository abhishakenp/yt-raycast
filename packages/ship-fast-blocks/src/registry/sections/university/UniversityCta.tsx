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
import { cn } from '#/lib/utils.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const UniversityCta = defineCapsule({
  name: 'UniversityCta',
  description:
    "Editorial-academic admissions conversion band for the University page family. Composes the shared CtaBand kit composite on a primary-tone surface with a giant ghost apply watermark and a left-aligned lockup: a mono tracked-uppercase deadline eyebrow, an invitational serif title, supporting copy, and two square routable actions — a primary 'Start your application' (inverted to read on the band, with press feedback) that targets the Admissions page and an outline 'Request info'. Use as the closing call to action before the footer on a university homepage.",
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
    const eyebrow = props.eyebrow ?? 'Fall applications close January 15'
    const title = props.title ?? 'Start your application'
    const subtitle =
      props.subtitle ??
      "Your place in our next class begins with a single step. Apply today, or request more information and we'll guide you through every part of the journey."
    const primaryLabel = props.primaryLabel ?? 'Start your application'
    const primaryTarget = props.primaryTarget ?? 'Admissions'
    const secondaryLabel = props.secondaryLabel ?? 'Request info'
    const secondaryTarget = props.secondaryTarget ?? 'Admissions'

    return (
      <CtaBand
        tone="primary"
        className={cn('relative overflow-hidden', props.className)}
      >
        <Watermark className="-right-4 bottom-[-2.5rem] font-serif text-[12rem] leading-none text-primary-foreground/10 sm:text-[18rem]">
          Apply
        </Watermark>
        <CtaBandInner align="left" className="relative gap-6">
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="font-serif text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-primary-foreground/80">
            {subtitle}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-2">
            <CtaAction variant="primary" invert asChild>
              <NavbarRouteLink
                href={primaryTarget}
                className="rounded-none px-7 py-3.5 transition-transform duration-150 active:translate-y-px"
              >
                {primaryLabel}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction variant="outline" asChild>
              <NavbarRouteLink
                href={secondaryTarget}
                className="rounded-none border-primary-foreground/40 bg-transparent px-7 py-3.5 text-primary-foreground transition-transform duration-150 hover:bg-primary-foreground/10 active:translate-y-px"
              >
                {secondaryLabel}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
