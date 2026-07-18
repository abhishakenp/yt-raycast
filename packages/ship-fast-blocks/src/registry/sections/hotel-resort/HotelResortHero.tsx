import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import {
  HotelBookingActionButton,
  HotelMutationSpinner,
} from './hotel-resort-interactions.tsx'
import { hotelResortLakebed } from './hotel-resort-lakebed.ts'

/**
 * HotelResortHero — full-bleed oceanfront photo hero for a luxury hotel /
 * resort & spa landing page. A near-full-viewport section over a full-cover
 * background image with a top-to-bottom darkening token gradient: a small
 * uppercase location eyebrow, a thin oversized multi-line headline, a light
 * supporting paragraph, dual CTAs (solid light primary + glassy outlined
 * secondary), and a row of trust badges beneath (first with a star icon, others
 * with a location-pin icon). Editorial, airy and high-end; booking CTA writes
 * to Lakebed while the explore CTA preserves page navigation. Use as the opening hero for hotels, beach or coastal resorts,
 * spa retreats, boutique inns, villas, or wellness destinations. Renders fully
 * with no props via baked-in "Azure Coast" defaults.
 */
export const HotelResortHero = defineCapsule({
  name: 'HotelResortHero',
  description:
    'Full-bleed oceanfront photo hero for a luxury hotel / resort & spa landing page: a near-full-viewport section over a full-cover background image with a darkening token gradient, a small uppercase location eyebrow, a thin oversized multi-line headline, a light supporting paragraph, dual CTAs (solid light primary Lakebed booking action + glassy outlined page navigation), and a row of trust badges beneath (a star badge plus location-pin badges). Editorial, airy and high-end; imagery uses the alt-driven Image component. Use as the opening hero for hotels, beach or coastal resorts, spa retreats, boutique inns, villas, or wellness destinations.',
  props: z.object({
    /** Uppercase location eyebrow above the headline. */
    location: z.string().optional(),
    /** First headline line. */
    headingTop: z.string().optional(),
    /** Second headline line. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Solid light primary CTA label. */
    primaryCta: z.string().optional(),
    /** Glassy outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the full-bleed background image. */
    imageAlt: z.string().optional(),
    /** Trust badges beneath the hero copy. */
    badges: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: hotelResortLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const location = props.location ?? 'Malibu, California'
    const headingTop = props.headingTop ?? 'Where the Pacific'
    const headingBottom = props.headingBottom ?? 'meets perfection'
    const subheading =
      props.subheading ??
      'Escape to Azure Coast Resort & Spa, an award-winning oceanfront sanctuary. Experience private beach access, world-class dining, and restorative wellness in our 47 exclusive suites.'
    const primaryCta = props.primaryCta ?? 'Check Availability'
    const secondaryCta = props.secondaryCta ?? 'Explore Suites'
    const imageAlt =
      props.imageAlt ??
      'Aerial view of luxury oceanfront resort with infinity pool overlooking turquoise waters at sunset'
    const badges = props.badges?.length
      ? props.badges
      : ['5-Star Forbes Rating', 'Private Beach Access']

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <HeroSection
        variant="gradient"
        className={cn('items-center pt-20', props.className)}
      >
        <div className="absolute inset-0 z-0">
          <Image
            alt={imageAlt}
            w={1920}
            h={1280}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/20 to-foreground/50" />
        </div>
        <HeroContent className="mx-auto max-w-7xl px-6 py-32 lg:px-8 lg:py-48">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm uppercase tracking-widest text-background/80">
              {location}
            </p>
            <h1 className="mb-6 text-4xl font-light leading-tight text-background md:text-5xl lg:text-7xl">
              {headingTop}
              <br />
              {headingBottom}
            </h1>
            <p className="mb-10 max-w-xl text-lg font-light leading-relaxed text-background/90 md:text-xl">
              {subheading}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <HotelBookingActionButton
                lakebed={lakebed}
                intentLabel={primaryCta}
                intentKey="hero-primary-booking"
                source="hero"
                pendingChildren={
                  <>
                    <HotelMutationSpinner />
                    Sending
                  </>
                }
                className="inline-flex items-center justify-center gap-2 rounded-md bg-background px-8 py-4 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
              >
                {primaryCta}
              </HotelBookingActionButton>
              <button
                type="button"
                onClick={() => go(secondaryCta)}
                className="rounded-md border border-background/30 bg-background/10 px-8 py-4 text-center text-sm font-medium text-background backdrop-blur-sm transition-colors hover:bg-background/20"
              >
                {secondaryCta}
              </button>
            </div>
            <div className="mt-16 flex flex-wrap items-center gap-8 text-sm text-background/70">
              {badges.map((badge, i) => (
                <div key={badge} className="flex items-center gap-2">
                  {i === 0 ? (
                    <StarIcon className="size-5" />
                  ) : (
                    <svg
                      className="size-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </HeroContent>
      </HeroSection>
    )
  },
})
