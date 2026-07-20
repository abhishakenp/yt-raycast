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
 * WebinarCta — kinetic-event final registration band for a webinar landing page.
 * An inverted `bg-foreground text-background` band, cut from its neighbor by a
 * slanted clip-path seam, with a giant ghost watermark behind a mono date-and-
 * seats urgency eyebrow, a countdown-scale extrabold "Reserve your spot — free"
 * headline, a short reassuring subheading, and a centered row of two square-edged
 * pill CTAs — a light "Save my seat" button with a hard offset shadow and press
 * feedback plus an outlined "Add to calendar" button. Both actions route through
 * the kit's section-kit route links so neither is a dead link. Use near the
 * bottom of a webinar, summit, or virtual event page to drive registrations.
 * Renders fully with no props.
 */
export const WebinarCta = defineCapsule({
  name: 'WebinarCta',
  description:
    "Kinetic-event final registration band for a webinar landing page built on the shared CtaBand composite: an inverted (foreground background, light text) band cut by a slanted clip-path seam, with a giant ghost watermark behind a mono date-and-seats urgency eyebrow, a countdown-scale extrabold 'Reserve your spot — free' headline, a short reassuring subheading, and a centered row of two square-edged pill CTAs (a light 'Save my seat' button with a hard offset shadow and press feedback plus an outlined 'Add to calendar' button). Both CTAs route through section-kit route links. Use near the bottom of a webinar, summit, or virtual-event page to drive registrations.",
  props: z.object({
    /** Urgency line shown as the band eyebrow (date + seats left). */
    eyebrow: z.string().optional(),
    /** Registration headline (maps to CtaBand title). */
    headline: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
    /** High-contrast primary CTA label. */
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
    const eyebrow =
      props.eyebrow ?? 'July 17 · 11:00 AM PT — only 87 seats left'
    const headline = props.headline ?? 'Reserve your spot — free'
    const subheading =
      props.subheading ??
      "Register in seconds. We'll send you the join link, calendar invite, and the recording afterward."
    const primaryCta = props.primaryCta ?? 'Save my seat'
    const primaryTarget = props.primaryTarget ?? 'Register'
    const secondaryCta = props.secondaryCta ?? 'Add to calendar'
    const secondaryTarget = props.secondaryTarget ?? 'Register'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-4 text-[7rem] leading-none text-background/[0.06] sm:text-[13rem] lg:text-[17rem]">
          RSVP
        </Watermark>
        <CtaBandInner className="relative pt-24">
          <CtaBandEyebrow className="font-mono text-[11px] tracking-[0.2em] text-background/70 opacity-100">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[0.95] tracking-tight text-background text-balance">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/80 text-pretty">
            {subheading}
          </CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction
              variant="primary"
              invert
              asChild
              className="rounded-none border border-background px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] shadow-[5px_5px_0_0] shadow-background/30 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0] hover:shadow-background/30 active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-background/40 bg-transparent px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-background transition-[transform,background-color,color] duration-150 hover:bg-background hover:text-foreground active:translate-y-px"
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
