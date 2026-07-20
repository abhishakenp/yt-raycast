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
/**
 * MusicFestivalCta — a kinetic-poster closing call-to-action band for a music /
 * arts festival landing page. A full-bleed inverted (foreground background,
 * light text) centered section under a giant ghost watermark word, with a mono
 * contact eyebrow, a poster-scale uppercase headline, a supporting paragraph,
 * and dual sharp CTAs (a hard-offset-shadow get-tickets stub beside an outlined
 * join-mailing-list stub, both with mechanical press feedback). Both CTAs route
 * through section-kit route links. Use as the final conversion push on music
 * festivals, arts festivals, concert series, or any multi-day ticketed event.
 */
export const MusicFestivalCta = defineCapsule({
  name: 'MusicFestivalCta',
  description:
    'Kinetic-poster closing call-to-action band for a music / arts festival landing page: a full-bleed inverted (foreground background, light text) centered section under a giant ghost watermark word, with a mono contact eyebrow, a poster-scale uppercase headline, a supporting paragraph, and dual sharp CTAs (a hard-offset-shadow get-tickets stub beside an outlined join-mailing-list stub, both with press feedback). Both CTAs route through section-kit route links. Use as the final conversion push before the footer on music festivals, arts festivals, concert series, raves, or any multi-day ticketed event.',
  props: z.object({
    /** Headline. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Small contact note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Your horizon awaits'
    const description =
      props.description ??
      'Join us August 15-17 for three days that will stay with you forever. Early bird pricing ends soon.'
    const primaryCta = props.primaryCta ?? 'Get Tickets'
    const secondaryCta = props.secondaryCta ?? 'Join Mailing List'
    const note =
      props.note ?? 'Questions? Email us at hello@horizonfestival.com'

    return (
      <CtaBand
        tone="primary"
        className={`relative overflow-hidden bg-foreground text-background ${props.className ?? ''}`}
      >
        <Watermark className="left-1/2 top-4 -translate-x-1/2 text-background/[0.06] text-[9rem] leading-[0.8] sm:text-[15rem]">
          {heading.split(' ').at(-1)}
        </Watermark>
        <CtaBandInner className="relative gap-6 py-20">
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
            {note}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold uppercase leading-[0.9] tracking-tight">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/70">
            {description}
          </CtaBandSubtitle>
          <CtaBandActions className="mt-2">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-background px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-foreground shadow-[5px_5px_0_0] shadow-background/30 transition-[transform,box-shadow] duration-150 hover:bg-background/90 hover:shadow-[7px_7px_0_0] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none motion-reduce:transform-none"
            >
              <NavbarRouteLink href={primaryCta}>{primaryCta}</NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border border-background bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-background transition-[transform,background-color] duration-150 hover:bg-background hover:text-foreground active:translate-y-px motion-reduce:transform-none"
            >
              <NavbarRouteLink href={secondaryCta}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
