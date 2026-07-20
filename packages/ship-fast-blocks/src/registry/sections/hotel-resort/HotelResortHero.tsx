import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  HotelBookingActionButton,
  HotelMutationSpinner,
} from './hotel-resort-interactions.tsx'
import { hotelResortLakebed } from './hotel-resort-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * HotelResortHero — full-bleed oceanfront photo hero for a luxury-editorial
 * hotel / resort & spa landing page, composed like a magazine cover. A
 * near-full-viewport section over a full-cover background image under layered
 * darkening token scrims and a giant ghost serif watermark: a mono location /
 * issue masthead row, a hairline rule, a thin oversized serif multi-line
 * headline, a light supporting paragraph, dual sharp-cornered CTAs (solid light
 * primary + hairline-outline glass ghost, both with press feedback), and a
 * hairline-separated mono trust-badge row beneath (first with a star icon,
 * others with a location-pin icon). Booking CTA writes to Lakebed while the
 * explore CTA preserves page navigation. Use as the opening hero for hotels,
 * beach or coastal resorts, spa retreats, boutique inns, villas, or wellness
 * destinations. Renders fully with no props via baked-in "Azure Coast" defaults.
 */
export const HotelResortHero = defineCapsule({
  name: 'HotelResortHero',
  description:
    'Full-bleed oceanfront photo hero for a luxury-editorial hotel / resort & spa landing page, composed like a magazine cover: a near-full-viewport section over a full-cover background image under layered darkening token scrims and a giant ghost serif watermark, with a mono location / issue masthead row, a hairline rule, a thin oversized serif multi-line headline, a light supporting paragraph, dual sharp-cornered CTAs (solid light primary Lakebed booking action + hairline-outline glass page-navigation ghost, both with press feedback), and a hairline-separated mono trust-badge row beneath (a star badge plus location-pin badges). Imagery uses the alt-driven Image component. Use as the opening hero for hotels, beach or coastal resorts, spa retreats, boutique inns, villas, or wellness destinations.',
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
        className={cn('items-stretch pt-20', props.className)}
      >
        <div className="absolute inset-0 z-0">
          <Image
            alt={imageAlt}
            w={1920}
            h={1280}
            className="size-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/25 to-foreground/40"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[0.16em] left-[-0.03em] select-none font-serif text-[28vw] font-normal leading-none tracking-tighter text-background/10"
          >
            {headingBottom.split(' ')[0]}
          </span>
        </div>
        <Container
          asChild
          size="xl"
          className="flex flex-col justify-between px-6 py-16 lg:px-8 lg:py-24"
        >
          <HeroContent>
            <div className="flex items-start justify-between gap-4 text-background">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em]">
                {location}
              </p>
              <span
                aria-hidden="true"
                className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.28em] text-background/70 sm:block"
              >
                The Resort / N° 01
              </span>
            </div>

            <div className="max-w-2xl">
              <div
                aria-hidden="true"
                className="mb-7 h-px w-16 bg-background/60"
              />
              <h1 className="mb-6 font-serif text-5xl font-normal leading-[0.95] tracking-tight text-background md:text-6xl lg:text-8xl">
                {headingTop}
                <br />
                {headingBottom}
              </h1>
              <p className="mb-10 max-w-xl text-base font-light leading-relaxed text-background/90 md:text-lg">
                {subheading}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
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
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-background px-8 py-4 text-center font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground transition-[background-color,transform] duration-150 hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                </HotelBookingActionButton>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border border-background/70 px-8 py-4 text-center font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-background transition-[background-color,color,transform] duration-150 hover:bg-background hover:text-foreground active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.16em] text-background/70">
                {badges.map((badge, i) => (
                  <div key={badge} className="flex items-center gap-2">
                    {i > 0 ? (
                      <span
                        aria-hidden="true"
                        className="mr-4 h-3 w-px bg-background/30"
                      />
                    ) : null}
                    {i === 0 ? (
                      <StarIcon className="size-4" />
                    ) : (
                      <svg
                        className="size-4"
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
        </Container>
      </HeroSection>
    )
  },
})
