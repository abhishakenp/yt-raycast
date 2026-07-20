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
 * VacationRentalCta — a closing booking band for a vacation-rental listing page,
 * rendered as the page's one inverted moment. Thin configuration over the shared
 * `CtaBand` composite flipped to a dark bg-foreground / text-background surface
 * with a slanted clip-path top seam and a giant ghost watermark word: a mono
 * eyebrow, an extrabold "Book your stay" title, a supporting subtitle, and a row
 * of routable square actions (a light primary "Book Now" and a hairline-outline
 * "Contact host"), both with press feedback. Actions route through section-kit
 * route links. Theme-token only. Use as the booking nudge near the end of a
 * vacation rental, beach house, cabin, villa, or boutique short-stay page.
 * Renders fully with no props via baked-in defaults.
 */
export const VacationRentalCta = defineCapsule({
  name: 'VacationRentalCta',
  description:
    "Closing booking band for a vacation-rental listing page rendered as the page's one inverted moment: the shared CtaBand composite flipped to a dark bg-foreground / text-background surface with a slanted clip-path top seam and a giant ghost watermark word, carrying a mono eyebrow, an extrabold Book your stay title, a supporting subtitle, and a row of routable square actions (a light primary Book Now and a hairline-outline Contact host) with press feedback. Actions route through section-kit route links. Theme-token only. Use as the booking nudge near the end of a vacation rental, beach house, cabin, villa, or boutique short-stay page.",
  props: z.object({
    /** Small eyebrow label above the title. */
    eyebrow: z.string().optional(),
    /** Band title. */
    title: z.string().optional(),
    /** Supporting subtitle under the title. */
    subtitle: z.string().optional(),
    /** Primary action label. */
    primaryLabel: z.string().optional(),
    /** Primary action navigation target. */
    primaryTarget: z.string().optional(),
    /** Outline action label. */
    secondaryLabel: z.string().optional(),
    /** Outline action navigation target. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const title = props.title ?? 'Book your stay'
    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-bottom-[0.12em] left-[-0.02em] text-[24vw] text-background/[0.06]">
          {title.split(' ')[0]}
        </Watermark>
        <CtaBandInner align="center" className="relative pt-24 pb-16 lg:pt-28">
          <CtaBandEyebrow className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background/70 opacity-100">
            {props.eyebrow ?? 'Dates fill up fast'}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
            {title}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-pretty text-background/80">
            {props.subtitle ??
              'Reserve your dates today and start counting down to slow mornings, salt air, and golden-hour swims.'}
          </CtaBandSubtitle>
          <CtaBandActions align="center" className="mt-2">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-background px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground transition-[background-color,transform] duration-150 hover:bg-background/90 active:translate-y-px"
            >
              <NavbarRouteLink href={props.primaryTarget ?? 'Book Now'}>
                {props.primaryLabel ?? 'Book Now'}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border border-background/60 bg-transparent px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-background transition-[background-color,color,transform] duration-150 hover:bg-background hover:text-foreground active:translate-y-px"
            >
              <NavbarRouteLink href={props.secondaryTarget ?? 'Contact'}>
                {props.secondaryLabel ?? 'Contact host'}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
