import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { Image } from '#/lib/img.tsx'
import {
  HotelBookingActionButton,
  HotelMutationSpinner,
} from './hotel-resort-interactions.tsx'
import { hotelResortLakebed } from './hotel-resort-lakebed.ts'

/**
 * HotelResortCta — full-bleed image call-to-action band for a luxury-editorial
 * hotel / resort & spa site. A centered section over a full-cover background
 * photo under a darkening token overlay and a giant ghost serif watermark: a
 * mono eyebrow above a hairline rule, a thin oversized serif headline, a light
 * supporting paragraph, and dual sharp-cornered CTAs (solid light primary +
 * hairline-outline glass ghost, both with press feedback, e.g. book + call).
 * Cinematic and conversion-focused; CTAs write Lakebed booking/inquiry intent.
 * Use as a closing booking push for hotels, resorts, spa retreats, villas, or
 * inns. Background uses the alt-driven Image component. Renders fully with no
 * props via baked-in resort defaults.
 */
export const HotelResortCta = defineCapsule({
  name: 'HotelResortCta',
  description:
    'Full-bleed image call-to-action band for a luxury-editorial hotel / resort & spa site: a centered section over a full-cover background photo under a darkening token overlay and a giant ghost serif watermark, with a mono eyebrow above a hairline rule, a thin oversized serif headline, a light supporting paragraph, and dual sharp-cornered scoped Lakebed CTAs (solid light primary booking action + hairline-outline glass secondary inquiry action, both with press feedback, e.g. book + call). Cinematic and conversion-focused; the background uses the alt-driven Image component. Use as a closing booking push for hotels, resorts, spa retreats, villas, or boutique inns.',
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Solid light primary CTA label. */
    primaryCta: z.string().optional(),
    /** Glassy outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the full-bleed background image. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: hotelResortLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Limited Availability'
    const heading = props.heading ?? 'Begin your Azure Coast experience'
    const description =
      props.description ??
      'Book direct for exclusive perks: complimentary room upgrade, late checkout, and a $100 resort credit. Summer availability is filling quickly.'
    const primaryCta = props.primaryCta ?? 'Check Availability'
    const secondaryCta = props.secondaryCta ?? 'Call 1-800-555-1234'
    const imageAlt =
      props.imageAlt ??
      'Sunset view over ocean from luxury resort balcony with warm golden lighting'

    return (
      <CtaBand
        tone="muted"
        className={`relative overflow-hidden ${props.className ?? ''}`}
      >
        <CtaBandInner className="max-w-3xl px-6 py-28 lg:py-36">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[0.14em] left-1/2 -translate-x-1/2 select-none font-serif text-[24vw] font-normal leading-none tracking-tighter text-background/[0.07]"
          >
            {heading.split(' ')[0]}
          </span>
          <CtaBandEyebrow className="font-mono text-[11px] font-medium normal-case tracking-[0.22em] text-background/80">
            {eyebrow}
          </CtaBandEyebrow>
          <div aria-hidden="true" className="h-px w-16 bg-background/50" />
          <CtaBandTitle className="font-serif text-4xl font-normal tracking-tight text-background md:text-5xl lg:text-6xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="font-light text-background/80">
            {description}
          </CtaBandSubtitle>
          <div className="absolute inset-0 -z-10">
            <Image
              alt={imageAlt}
              w={1920}
              h={1080}
              loading="lazy"
              className="size-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-foreground/55"
            />
          </div>
          <div className="mt-2 flex flex-col justify-center gap-3 sm:flex-row">
            <HotelBookingActionButton
              lakebed={lakebed}
              intentLabel={primaryCta}
              intentKey="cta-primary-booking"
              source="cta"
              pendingChildren={
                <>
                  <HotelMutationSpinner />
                  Sending
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-none bg-background px-10 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground transition-[background-color,transform] duration-150 hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              {primaryCta}
            </HotelBookingActionButton>
            <HotelBookingActionButton
              lakebed={lakebed}
              action="inquiry"
              intentLabel={secondaryCta}
              intentKey="cta-secondary-inquiry"
              source="cta"
              pendingChildren={
                <>
                  <HotelMutationSpinner />
                  Sending
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-none border border-background/70 px-10 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-background backdrop-blur-sm transition-[background-color,color,transform] duration-150 hover:bg-background hover:text-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              {secondaryCta}
            </HotelBookingActionButton>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
