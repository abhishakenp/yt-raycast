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
 * FoodTruckContactCta — a sticker-poster inverted closing contact CTA band with a slanted
 * clip-path seam. A foreground-filled section under a giant ghost "BOOK" watermark, with a
 * mono response-time eyebrow, an extrabold slab heading, a supporting paragraph and a pair
 * of hard-bordered rounded-none slab buttons (an inverted email CTA + an outlined phone
 * CTA) with press feedback. Both buttons route through section-kit route links. Use as the
 * final call-to-action / get-in-touch band for food trucks, caterers or street-food vendors
 * prompting bookings and enquiries.
 */
export const FoodTruckContactCta = defineCapsule({
  name: 'FoodTruckContactCta',
  description:
    'Sticker-poster inverted closing contact CTA band with a slanted clip-path seam: a foreground-filled section under a giant ghost "BOOK" watermark, with a mono response-time eyebrow, an extrabold slab heading, a supporting paragraph and a pair of hard-bordered rounded-none slab buttons (an inverted email CTA and an outlined phone CTA) with press feedback. Both buttons route through section-kit route links. Use as the final call-to-action / get-in-touch band for food trucks, caterers, street-food vendors or restaurants prompting catering bookings and enquiries.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    emailCta: z.string().optional(),
    phoneCta: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const ctaHeading = props.heading ?? 'Ready to book the truck?'
    const ctaDesc =
      props.description ??
      'From office lunches to wedding receptions, we bring the flavor. Get in touch for a custom quote.'
    const ctaEmail = props.emailCta ?? 'Email Us'
    const ctaPhone = props.phoneCta ?? '(310) 555-1234'
    const ctaNote = props.note ?? 'Typical response time: under 24 hours'

    return (
      <CtaBand
        tone="primary"
        className={`relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] ${props.className ?? ''}`}
      >
        <Watermark className="-right-6 top-8 text-[7rem] text-background/[0.06] sm:text-[12rem] lg:text-[16rem]">
          BOOK
        </Watermark>
        <CtaBandInner className="relative pt-24">
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-80">
            {ctaNote}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-4xl font-extrabold tracking-tighter md:text-5xl">
            {ctaHeading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/80">
            {ctaDesc}
          </CtaBandSubtitle>
          <CtaBandActions className="pt-2">
            <CtaAction
              variant="primary"
              invert
              asChild
              className="rounded-none border-2 border-background px-6 py-3 font-bold uppercase tracking-wide shadow-[4px_4px_0_0] shadow-background/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] active:translate-y-px active:shadow-none"
            >
              <NavbarRouteLink href={ctaEmail}>{ctaEmail}</NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-2 border-background bg-transparent px-6 py-3 font-bold uppercase tracking-wide text-background transition-all duration-150 hover:-translate-y-0.5 hover:bg-background hover:text-foreground active:translate-y-px"
            >
              <NavbarRouteLink href={ctaPhone}>{ctaPhone}</NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
