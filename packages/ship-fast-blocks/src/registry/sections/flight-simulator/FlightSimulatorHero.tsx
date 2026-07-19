import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FlightSimulatorHero — full-bleed, cinematic hero for a flight simulator
 * landing page. A single immersive cockpit-above-the-clouds photograph fills the
 * band edge to edge with a token-based dark overlay so light text reads cleanly
 * on top. Centered content stacks an uppercase eyebrow pill, a large headline, a
 * supporting paragraph, dual CTAs (filled "Buy Now" + outlined translucent
 * "Watch Trailer"), and a divider-separated spec strip (aircraft count, scenery,
 * platforms). CTAs route through section-kit route links. Use as the opening hero for flight
 * simulators, airliner / combat sims, and immersive aviation titles. Renders
 * fully with no props via baked-in defaults.
 */
export const FlightSimulatorHero = defineCapsule({
  name: 'FlightSimulatorHero',
  description:
    "Full-bleed cinematic hero for a flight-simulator landing page: one immersive cockpit-above-the-clouds photo fills the band edge to edge under a token-based dark overlay so light text stays readable. Centered content has an uppercase eyebrow pill, a large headline, a supporting paragraph, dual CTAs (filled 'Buy Now' + outlined translucent 'Watch Trailer'), and a divider-separated spec strip (aircraft count, scenery, platforms). CTAs route through section-kit route links. Use as the opening hero for flight simulators, airliner / combat sims, and immersive aviation titles.",
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
      <HeroSection variant="full-bleed" className={props.className}>
        <HeroBackgroundImage
          alt={heroImageAlt}
          overlayClassName="bg-foreground/60"
          gradientClassName="bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/50"
        />

        <Container asChild>
          <HeroContent className="flex flex-col items-center pb-28 pt-36 text-center sm:pt-40 lg:pb-32 lg:pt-48">
            <HeroBadge variant="pill">{heroEyebrow}</HeroBadge>

            <HeroHeading className="mt-8 max-w-3xl text-background">
              {heroHeading}
            </HeroHeading>

            <HeroSubheading variant="light">{heroSub}</HeroSubheading>

            <HeroActions className="mt-10 flex-col gap-4 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-full px-8 py-4 font-medium"
              >
                <NavbarRouteLink href={heroPrimaryTarget}>
                  {heroPrimary}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-full border-border bg-card/10 px-8 py-4 font-medium text-background backdrop-blur-sm hover:bg-card/20"
              >
                <NavbarRouteLink href={heroSecondaryTarget}>
                  {heroSecondary}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>

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
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
