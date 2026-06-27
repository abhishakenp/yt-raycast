import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  RestaurantMutationSpinner,
  RestaurantReservationButton,
} from './restaurant-interactions.tsx'
import { restaurantLakebed } from './restaurant-lakebed.ts'

/**
 * RestaurantHero — full-bleed, image-forward hero for a restaurant landing page.
 * A single appetizing food / dining-room photograph fills the band edge to edge
 * with a token-based dark overlay so light, serif text reads cleanly on top.
 * Centered content stacks an uppercase eyebrow pill, a large serif headline, a
 * supporting paragraph, dual CTAs (filled "Reserve a Table" + outlined "View
 * Menu"), and a divider-separated hours / location / phone strip beneath. CTAs
 * route through useNavigate. Use as the opening hero for casual or upscale
 * restaurants, bistros, eateries, fine-dining rooms, and chef-driven venues.
 * Renders fully with no props via baked-in defaults.
 */
export const RestaurantHero = defineCapsule({
  name: 'RestaurantHero',
  description:
    "Full-bleed image-forward hero for a restaurant landing page: one appetizing food / dining-room photo fills the band edge to edge under a token-based dark overlay so light serif text stays readable. Centered content has an uppercase eyebrow pill, a large serif headline, a supporting paragraph, dual CTAs (filled 'Reserve a Table' + outlined translucent 'View Menu'), and a divider-separated hours / location / phone strip. CTAs route through useNavigate. Use as the opening hero for casual or upscale restaurants, bistros, eateries, fine-dining rooms, and chef-driven venues.",
  props: z.object({
    /** Small uppercase eyebrow pill above the headline. */
    eyebrow: z.string().optional(),
    /** Large serif headline. */
    heading: z.string().optional(),
    /** Supporting paragraph beneath the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the full-bleed hero photo. */
    imageAlt: z.string().optional(),
    /** Opening hours line in the info strip. */
    hours: z.string().optional(),
    /** Address line in the info strip. */
    location: z.string().optional(),
    /** Phone number in the info strip. */
    phone: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: restaurantLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heroEyebrow = props.eyebrow ?? 'Farm-to-table · Est. 2014'
    const heroHeading =
      props.heading ?? 'Seasonal plates, unforgettable evenings'
    const heroSub =
      props.subheading ??
      "A neighborhood kitchen serving wood-fired dishes, natural wines, and warm hospitality. Reserve your table for an evening built around the day's freshest market finds."
    const heroPrimary = props.primaryCta ?? 'Reserve a Table'
    const heroPrimaryTarget = props.primaryTarget ?? 'Reservations'
    const heroSecondary = props.secondaryCta ?? 'View Menu'
    const heroSecondaryTarget = props.secondaryTarget ?? 'Menu'
    const heroImageAlt =
      props.imageAlt ??
      'beautifully plated seasonal dish on a rustic wooden table in a warm candlelit dining room'
    const heroHours = props.hours ?? 'Open Tue–Sun · 5pm–11pm'
    const heroLocation = props.location ?? '123 Market St, San Francisco'
    const heroPhone = props.phone ?? '(415) 555-0182'

    const infoItems = [heroHours, heroLocation, heroPhone].filter(Boolean)

    return (
      <section
        className={cn('relative isolate overflow-hidden', props.className)}
      >
        <Image
          alt={heroImageAlt}
          w={1920}
          h={1080}
          loading="lazy"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-foreground/60"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground/70 via-foreground/30 to-foreground/50"
        />

        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-28 pt-36 text-center sm:pt-40 lg:px-8 lg:pb-32 lg:pt-48">
          <span className="inline-flex items-center rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-background uppercase backdrop-blur-sm">
            {heroEyebrow}
          </span>

          <h1 className="mt-8 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight text-background sm:text-5xl lg:text-6xl">
            {heroHeading}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-background/80 sm:text-lg">
            {heroSub}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <RestaurantReservationButton
              lakebed={lakebed}
              input={{ label: heroPrimary, source: heroPrimaryTarget }}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              pendingChildren={<RestaurantMutationSpinner />}
            >
              {heroPrimary}
            </RestaurantReservationButton>
            <button
              type="button"
              onClick={() => go(heroSecondaryTarget)}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card/10 px-8 py-4 font-medium text-background backdrop-blur-sm transition-colors hover:bg-card/20"
            >
              {heroSecondary}
            </button>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-background/80">
            {infoItems.map((item, i) => (
              <div key={item} className="flex items-center gap-x-4">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-4 w-px bg-background/30 sm:block"
                  />
                )}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
