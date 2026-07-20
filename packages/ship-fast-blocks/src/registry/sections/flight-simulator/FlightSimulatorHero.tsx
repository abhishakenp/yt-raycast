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
 * FlightSimulatorHero — full-bleed, cinematic HUD hero for a flight simulator
 * landing page. A single immersive cockpit-above-the-clouds photograph fills the
 * band edge to edge under a token-based dark overlay so light text reads cleanly,
 * with an instrument-terminal overlay on top: corner HUD brackets, a giant ghost
 * "FL350" flight-level watermark, and left-aligned content that stacks a mono
 * square status chip, a large headline, a supporting paragraph, dual square CTAs
 * with hard offset shadows and press feedback (filled "Buy Now" + translucent
 * outlined "Watch Trailer"), and a collapsed-border HUD readout ledger
 * (FLEET / WORLD / PLATFORMS). CTAs route through section-kit route links. Use as
 * the opening hero for flight simulators, airliner / combat sims, and immersive
 * aviation titles. Renders fully with no props via baked-in defaults.
 */
export const FlightSimulatorHero = defineCapsule({
  name: 'FlightSimulatorHero',
  description:
    "Full-bleed cinematic HUD hero for a flight-simulator landing page: one immersive cockpit-above-the-clouds photo fills the band edge to edge under a token-based dark overlay so light text stays readable, with an instrument-terminal overlay — corner HUD brackets, a giant ghost 'FL350' flight-level watermark, and left-aligned content: a mono square status chip, a large headline, a supporting paragraph, dual square CTAs with hard offset shadows and press feedback (filled 'Buy Now' + translucent outlined 'Watch Trailer'), and a collapsed-border HUD readout ledger (FLEET / WORLD / PLATFORMS). CTAs route through section-kit route links. Use as the opening hero for flight simulators, airliner / combat sims, and immersive aviation titles.",
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

    const specItems = [
      { label: 'Fleet', value: heroAircraft },
      { label: 'World', value: heroScenery },
      { label: 'Platforms', value: heroPlatforms },
    ].filter((item) => Boolean(item.value))

    return (
      <HeroSection variant="full-bleed" className={props.className}>
        <HeroBackgroundImage
          alt={heroImageAlt}
          overlayClassName="bg-foreground/65"
          gradientClassName="bg-gradient-to-t from-foreground/85 via-foreground/35 to-foreground/55"
        />

        {/* Giant ghost flight-level watermark. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 bottom-6 z-0 select-none font-mono text-[7rem] font-extrabold leading-none tracking-tighter text-background/[0.06] sm:text-[10rem] lg:text-[13rem]"
        >
          FL350
        </span>

        {/* HUD corner brackets. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-6 z-0 hidden sm:block lg:inset-10"
        >
          <span className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-background/25" />
          <span className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-background/25" />
          <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-background/25" />
          <span className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-background/25" />
        </div>

        <Container asChild>
          <HeroContent className="flex flex-col items-start pb-24 pt-36 text-left sm:pt-40 lg:pb-32 lg:pt-48">
            <HeroBadge
              variant="pill"
              className="gap-2 rounded-none border-background/30 font-mono tracking-[0.2em]"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
              {heroEyebrow}
            </HeroBadge>

            <HeroHeading className="mt-8 max-w-3xl text-balance text-background">
              {heroHeading}
            </HeroHeading>

            <HeroSubheading variant="light" className="text-pretty">
              {heroSub}
            </HeroSubheading>

            <HeroActions className="mt-10 w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-none px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.15em] shadow-[5px_5px_0_0] shadow-background/30 transition-[transform,box-shadow] duration-150 hover:bg-primary active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transform-none"
              >
                <NavbarRouteLink href={heroPrimaryTarget}>
                  {heroPrimary}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-none border-background/40 bg-background/10 px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-background backdrop-blur-sm transition-[transform,background-color] duration-150 hover:bg-background/20 active:translate-y-px motion-reduce:transform-none"
              >
                <NavbarRouteLink href={heroSecondaryTarget}>
                  {heroSecondary}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>

            {/* Collapsed-border HUD readout ledger. */}
            <div className="mt-14 grid w-full max-w-2xl grid-cols-3 border-l border-t border-background/25">
              {specItems.map((item) => (
                <div
                  key={item.label}
                  className="border-b border-r border-background/25 px-3 py-4 sm:px-5"
                >
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
                    {item.label}
                  </span>
                  <span className="mt-1.5 block text-sm font-medium leading-snug text-background sm:text-base">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
