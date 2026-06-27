import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * FlightSimulatorHero — full-bleed, cinematic hero for a flight simulator
 * landing page. A single immersive cockpit-above-the-clouds photograph fills the
 * band edge to edge with a token-based dark overlay so light text reads cleanly
 * on top. Centered content stacks an uppercase eyebrow pill, a large headline, a
 * supporting paragraph, dual CTAs (filled "Buy Now" + outlined translucent
 * "Watch Trailer"), and a divider-separated spec strip (aircraft count, scenery,
 * platforms). CTAs route through useNavigate. Use as the opening hero for flight
 * simulators, airliner / combat sims, and immersive aviation titles. Renders
 * fully with no props via baked-in defaults.
 */
export const FlightSimulatorHero = defineCapsule({
  name: 'FlightSimulatorHero',
  description:
    "Full-bleed cinematic hero for a flight-simulator landing page: one immersive cockpit-above-the-clouds photo fills the band edge to edge under a token-based dark overlay so light text stays readable. Centered content has an uppercase eyebrow pill, a large headline, a supporting paragraph, dual CTAs (filled 'Buy Now' + outlined translucent 'Watch Trailer'), and a divider-separated spec strip (aircraft count, scenery, platforms). CTAs route through useNavigate. Use as the opening hero for flight simulators, airliner / combat sims, and immersive aviation titles.",
  props: z.object({
    /** Small uppercase eyebrow pill above the headline. */
    eyebrow: z.string().optional(),
    /** Large headline. */
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
    /** Aircraft-count line in the spec strip. */
    aircraft: z.string().optional(),
    /** Scenery line in the spec strip. */
    scenery: z.string().optional(),
    /** Platforms line in the spec strip. */
    platforms: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heroEyebrow = props.eyebrow ?? 'Next-generation flight simulation'
    const heroHeading = props.heading ?? 'Take to the skies like never before'
    const heroSub =
      props.subheading ??
      'Fly the entire planet in stunning photoreal detail with true-to-life aircraft, live real-world weather, and the most accurate flight model ever built. From bush strips to international hubs, every journey is yours to fly.'
    const heroPrimary = props.primaryCta ?? 'Buy Now'
    const heroPrimaryTarget = props.primaryTarget ?? 'Buy'
    const heroSecondary = props.secondaryCta ?? 'Watch Trailer'
    const heroSecondaryTarget = props.secondaryTarget ?? 'Trailer'
    const heroImageAlt =
      props.imageAlt ??
      'airliner cockpit view above a sea of clouds at golden hour with the horizon glowing orange'
    const heroAircraft = props.aircraft ?? '200+ aircraft'
    const heroScenery = props.scenery ?? 'Global photoreal scenery'
    const heroPlatforms = props.platforms ?? 'PC · Xbox · VR'

    const specItems = [heroAircraft, heroScenery, heroPlatforms].filter(Boolean)

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
          className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/50"
        />

        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-28 pt-36 text-center sm:pt-40 lg:px-8 lg:pb-32 lg:pt-48">
          <span className="inline-flex items-center rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-background uppercase backdrop-blur-sm">
            {heroEyebrow}
          </span>

          <h1 className="mt-8 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-background sm:text-5xl lg:text-6xl">
            {heroHeading}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-background/80 sm:text-lg">
            {heroSub}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(heroPrimaryTarget)}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {heroPrimary}
            </button>
            <button
              type="button"
              onClick={() => go(heroSecondaryTarget)}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card/10 px-8 py-4 font-medium text-background backdrop-blur-sm transition-colors hover:bg-card/20"
            >
              {heroSecondary}
            </button>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-background/80">
            {specItems.map((item, i) => (
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
