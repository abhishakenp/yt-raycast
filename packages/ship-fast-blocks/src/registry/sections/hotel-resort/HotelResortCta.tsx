import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'
import { Image } from '#/lib/img.tsx'
import {
  HotelBookingActionButton,
  HotelMutationSpinner,
} from './hotel-resort-interactions.tsx'
import { hotelResortLakebed } from './hotel-resort-lakebed.ts'

/**
 * HotelResortCta — full-bleed image call-to-action band for a luxury hotel /
 * resort & spa site. A centered section over a full-cover background photo with
 * a darkening token overlay: an uppercase eyebrow, a thin oversized headline, a
 * light supporting paragraph, and dual CTAs (solid light primary + glassy
 * outlined secondary, e.g. book + call). Cinematic and conversion-focused; CTAs
 * write Lakebed booking/inquiry intent. Use as a closing booking push for hotels, resorts,
 * spa retreats, villas, or inns. Background uses the alt-driven Image component.
 * Renders fully with no props via baked-in resort defaults.
 */
export const HotelResortCta = defineCapsule({
  name: 'HotelResortCta',
  description:
    'Full-bleed image call-to-action band for a luxury hotel / resort & spa site: a centered section over a full-cover background photo with a darkening token overlay, an uppercase eyebrow, a thin oversized headline, a light supporting paragraph, and dual scoped Lakebed CTAs (solid light primary booking action + glassy outlined secondary inquiry action, e.g. book + call). Cinematic and conversion-focused; the background uses the alt-driven Image component. Use as a closing booking push for hotels, resorts, spa retreats, villas, or boutique inns.',
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
        eyebrow={eyebrow}
        title={heading}
        subtitle={description}
        titleClassName="text-background font-light md:text-4xl lg:text-5xl"
        subtitleClassName="text-background/80 font-light"
        eyebrowClassName="text-background/80 normal-case tracking-widest"
        className={`relative overflow-hidden ${props.className ?? ''}`}
      >
        <div className="absolute inset-0 -z-10">
          <Image
            alt={imageAlt}
            w={1920}
            h={1080}
            loading="lazy"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
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
            className="inline-flex items-center justify-center gap-2 rounded-md bg-background px-10 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
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
            className="inline-flex items-center justify-center gap-2 rounded-md border border-background/30 bg-background/10 px-10 py-4 text-sm font-medium text-background backdrop-blur-sm transition-colors hover:bg-background/20 disabled:pointer-events-none disabled:opacity-70"
          >
            {secondaryCta}
          </HotelBookingActionButton>
        </div>
      </CtaBand>
    )
  },
})
