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
} from '#/section-kit/CtaBand.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const PetVeterinaryCta = defineCapsule({
  name: 'PetVeterinaryCta',
  description:
    "Warm friendly-clinical closing call-to-action band for a veterinary clinic site, composing the CtaBand kit composite as the single full-inversion moment of the page: a bg-foreground / text-background band cut by a slanted clip-path seam and carrying a giant ghost 'care' watermark, a mono caring eyebrow, an inviting left-aligned 'Schedule your pet's visit' title and subtitle, and two rounded-full pill actions with hard offset shadows and press feedback — a filled background-on-ink 'Book Appointment' and a hairline outline 'Call Us'. Accepts public props to override the copy and CTA targets. Use it as the final conversion band of a pet-care page to gently nudge pet parents to take the next step.",
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
    const eyebrow = props.eyebrow ?? "We can't wait to meet your furry friend"
    const headline = props.headline ?? "Schedule your pet's visit"
    const subheading =
      props.subheading ??
      "Compassionate, gentle care is just a click away. Book online or give us a call — we'll treat your pet like family."
    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-right-8 -top-12 text-[12rem] lowercase text-background/[0.05] sm:text-[20rem]">
          care
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-5xl items-start gap-6 pb-20 pt-24 text-left sm:pb-24 sm:pt-28 lg:pb-28 lg:pt-32"
        >
          <CtaBandEyebrow className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-background/60 opacity-100">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-3xl text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.02] tracking-tight">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/70 opacity-100">
            {subheading}
          </CtaBandSubtitle>
          <CtaBandActions
            align="left"
            className="mt-2 w-full gap-3 sm:w-auto sm:gap-4"
          >
            <NavbarRouteLink
              href={props.primaryTarget ?? 'Contact'}
              className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-base font-semibold text-foreground shadow-[4px_4px_0_0] shadow-background/25 transition-colors hover:bg-background/90 active:translate-y-px active:shadow-none"
            >
              {props.primaryCta ?? 'Book Appointment'}
            </NavbarRouteLink>
            <NavbarRouteLink
              href={props.secondaryTarget ?? 'Contact'}
              className="inline-flex items-center justify-center rounded-full border-2 border-background/30 px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-background/10 active:translate-y-px"
            >
              {props.secondaryCta ?? 'Call Us'}
            </NavbarRouteLink>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
