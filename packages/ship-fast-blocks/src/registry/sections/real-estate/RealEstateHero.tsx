import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
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
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * RealEstateHero — full-bleed property hero for a premium brokerage. A striking
 * home photograph fills the band edge to edge under a token-based dark overlay
 * so light text reads cleanly. Centered content stacks an uppercase eyebrow, a
 * large serif headline, a supporting paragraph, dual CTAs ("Search Homes" +
 * "Talk to an Agent"), and a search-bar affordance card (location / type /
 * price inputs with a search button) that routes through useNavigate. Use as
 * the opening hero for real-estate brokerages, agent sites, and listing portals.
 * Renders fully with no props via baked-in defaults.
 */
export const RealEstateHero = defineCapsule({
  name: 'RealEstateHero',
  description:
    "Full-bleed property hero for a premium brokerage: a striking home photo fills the band under a token-based dark overlay so light text reads cleanly. Centered content has an uppercase eyebrow, a large serif headline, a supporting paragraph, dual CTAs ('Search Homes' filled + 'Talk to an Agent' outlined), and a search-bar affordance card with location / type / price inputs and a search button. CTAs and search route through useNavigate. Use as the opening hero for real-estate brokerages, agent sites, and listing portals.",
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
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
    /** Placeholder for the location search input. */
    locationPlaceholder: z.string().optional(),
    /** Placeholder for the property-type input. */
    typePlaceholder: z.string().optional(),
    /** Placeholder for the price input. */
    pricePlaceholder: z.string().optional(),
    /** Search button label inside the search card. */
    searchLabel: z.string().optional(),
    /** Route label the search button navigates to. */
    searchTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Trusted since 1998'
    const heading = props.heading ?? 'Find the home that fits your life'
    const subheading =
      props.subheading ??
      'From first keys to forever homes, our agents guide you through every street, every showing, and every signature with confidence.'
    const primaryCta = props.primaryCta ?? 'Search Homes'
    const primaryTarget = props.primaryTarget ?? 'Buy'
    const secondaryCta = props.secondaryCta ?? 'Talk to an Agent'
    const secondaryTarget = props.secondaryTarget ?? 'Agents'
    const imageAlt =
      props.imageAlt ??
      'modern luxury suburban home at dusk with warm interior lighting, manicured lawn, and a long stone driveway'
    const locationPlaceholder =
      props.locationPlaceholder ?? 'City, neighborhood, or ZIP'
    const typePlaceholder = props.typePlaceholder ?? 'Property type'
    const pricePlaceholder = props.pricePlaceholder ?? 'Max price'
    const searchLabel = props.searchLabel ?? 'Search Homes'
    const searchTarget = props.searchTarget ?? 'Buy'

    return (
      <HeroSection variant="full-bleed" className={props.className}>
        <HeroBackgroundImage
          alt={imageAlt}
          overlayClassName="bg-foreground/55"
          gradientClassName="bg-gradient-to-t from-foreground/70 via-foreground/25 to-foreground/45"
        />

        <Container asChild>
          <HeroContent className="flex flex-col items-center pb-28 pt-36 text-center sm:pt-40 lg:pb-32 lg:pt-48">
            <HeroBadge variant="pill">{eyebrow}</HeroBadge>

            <HeroHeading variant="serif">{heading}</HeroHeading>

            <HeroSubheading variant="light">{subheading}</HeroSubheading>

            <HeroActions className="mt-10 flex-col gap-4 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-full px-8 py-4 font-medium"
              >
                <button type="button" onClick={() => go(primaryTarget)}>
                  {primaryCta}
                </button>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-full border-border bg-card/10 px-8 py-4 font-medium text-background backdrop-blur-sm hover:bg-card/20"
              >
                <button type="button" onClick={() => go(secondaryTarget)}>
                  {secondaryCta}
                </button>
              </HeroCta>
            </HeroActions>

            <Card
              variant="default"
              className="mt-14 w-full max-w-3xl bg-background/95 p-3 backdrop-blur rounded-2xl p-0 shadow-lg"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 rounded-xl bg-muted px-4 py-3 text-left text-sm text-muted-foreground">
                  {locationPlaceholder}
                </div>
                <div className="rounded-xl bg-muted px-4 py-3 text-left text-sm text-muted-foreground sm:w-40">
                  {typePlaceholder}
                </div>
                <div className="rounded-xl bg-muted px-4 py-3 text-left text-sm text-muted-foreground sm:w-36">
                  {pricePlaceholder}
                </div>
                <button
                  type="button"
                  onClick={() => go(searchTarget)}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {searchLabel}
                </button>
              </div>
            </Card>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
