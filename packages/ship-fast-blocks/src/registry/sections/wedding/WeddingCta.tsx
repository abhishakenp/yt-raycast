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
export const WeddingCta = defineCapsule({
  name: 'WeddingCta',
  description:
    'Romantic-editorial closing RSVP band for a wedding site — the single full-inversion moment of the page: a bg-foreground / text-background band with a gentle slanted clip-path seam at the top edge and a giant ghost serif ampersand watermark, a mono RSVP-by eyebrow, a warm serif-italic headline inviting guests to respond, a heartfelt supporting line, and dual sharp-cornered routable actions (RSVP plus View Details) with press feedback. Both actions route through section-kit route links. Use near the end of a wedding invitation or celebration page to prompt guests to confirm their attendance.',
  props: z.object({
    headline: z.string().optional(),
    subheading: z.string().optional(),
    rsvpBy: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-bottom-16 -right-8 font-serif text-[11rem] font-normal italic text-background/[0.06] sm:text-[17rem]">
          &amp;
        </Watermark>
        <CtaBandInner className="max-w-5xl items-start gap-6 pt-28 pb-20 text-left lg:pt-32 lg:pb-28">
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.25em] text-background/70 opacity-100">
            {props.rsvpBy ?? 'Kindly respond by August 1, 2025'}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-3xl font-serif text-[clamp(2.25rem,5vw,4rem)] font-normal italic leading-[1.04] tracking-tight">
            {props.headline ?? 'Join us — RSVP by August 1'}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/70 opacity-100">
            {props.subheading ??
              "Nothing would mean more than celebrating this day with you. Let us know you're coming so we can save you a seat at the table."}
          </CtaBandSubtitle>
          <CtaBandActions className="relative w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-background px-8 py-4 text-base font-medium text-foreground hover:bg-background/90 active:translate-y-px"
            >
              <NavbarRouteLink href={props.primaryTarget ?? 'RSVP'}>
                {props.primaryCta ?? 'RSVP'}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-background/30 bg-transparent px-8 py-4 text-base font-medium text-background hover:bg-background/10 active:translate-y-px"
            >
              <NavbarRouteLink href={props.secondaryTarget ?? 'Details'}>
                {props.secondaryCta ?? 'View Details'}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
