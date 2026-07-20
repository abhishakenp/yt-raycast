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
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * RealEstateHero — editorial full-bleed property hero for a luxury brokerage. A
 * striking home photograph fills the band edge to edge under a token-based dark
 * overlay so light text reads cleanly. Left-aligned content opens with a mono
 * metadata rail (eyebrow · hairline rule · index), a large serif display
 * headline, a supporting paragraph, and dual sharp-cornered CTAs ("Search
 * Homes" crisp light + "Talk to an Agent" hairline outline, both with press
 * feedback). Below sits a sharp-edged, collapsed-border search ledger (location
 * / type / price cells + a square search button) routing through section-kit
 * route links. Use as the opening hero for real-estate brokerages, agent sites,
 * and listing portals. Renders fully with no props via baked-in defaults.
 */
export const RealEstateHero = defineCapsule({
  name: 'RealEstateHero',
  description:
    "Editorial full-bleed property hero for a luxury brokerage: a striking home photo fills the band under a token-based dark overlay so light text reads cleanly. Left-aligned content has a mono metadata rail (eyebrow · hairline rule · index), a large serif display headline, a supporting paragraph, and dual sharp-cornered CTAs ('Search Homes' crisp light + 'Talk to an Agent' hairline outline) with press feedback, above a sharp-edged collapsed-border search ledger with location / type / price cells and a square search button. CTAs and search route through section-kit route links. Use as the opening hero for real-estate brokerages, agent sites, and listing portals.",
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

    const fields = [
      { text: locationPlaceholder, label: 'Location', className: 'sm:flex-1' },
      { text: typePlaceholder, label: 'Type', className: 'sm:w-44' },
      { text: pricePlaceholder, label: 'Budget', className: 'sm:w-40' },
    ]

    return (
      <HeroSection variant="full-bleed" className={props.className}>
        <HeroBackgroundImage
          alt={imageAlt}
          overlayClassName="bg-foreground/55"
          gradientClassName="bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/50"
        />

        <Container asChild>
          <HeroContent className="flex flex-col items-start pb-24 pt-36 text-left sm:pt-40 lg:pb-28 lg:pt-48">
            {/* Mono metadata rail: eyebrow · hairline rule · index. */}
            <div className="flex w-full max-w-xl items-center gap-4">
              <HeroBadge
                variant="pill"
                className="rounded-none border-background/30 bg-background/10 px-3 py-1.5 font-mono text-[11px] tracking-[0.22em]"
              >
                {eyebrow}
              </HeroBadge>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-background/25"
              />
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.28em] text-background/50 tabular-nums"
              >
                01 / 24
              </span>
            </div>

            <HeroHeading
              variant="serif"
              className="mt-7 max-w-4xl text-4xl leading-[1.02] sm:text-6xl lg:text-7xl"
            >
              {heading}
            </HeroHeading>

            <HeroSubheading variant="light" className="max-w-xl">
              {subheading}
            </HeroSubheading>

            <HeroActions className="mt-9 w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <HeroCta
                asChild
                variant="none"
                className="rounded-none bg-background px-8 py-4 font-medium text-foreground transition-[background-color,transform] duration-150 hover:bg-background/90 active:translate-y-px"
              >
                <NavbarRouteLink href={primaryTarget}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="none"
                className="rounded-none border border-background/40 bg-background/5 px-8 py-4 font-medium text-background backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-background/15 active:translate-y-px"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>

            {/* Sharp-edged collapsed-border search ledger. */}
            <Card
              variant="default"
              className="mt-12 w-full max-w-3xl rounded-none border-background/15 bg-background/95 p-0 shadow-[10px_10px_0_0] shadow-foreground/20 backdrop-blur"
            >
              <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
                {fields.map((field) => (
                  <div
                    key={field.label}
                    className={`px-5 py-3.5 text-left ${field.className}`}
                  >
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                      {field.label}
                    </span>
                    <span className="mt-1 block truncate text-sm text-foreground">
                      {field.text}
                    </span>
                  </div>
                ))}
                <NavbarRouteLink
                  className="inline-flex items-center justify-center whitespace-nowrap bg-foreground px-7 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px"
                  href={searchTarget}
                >
                  {searchLabel}
                </NavbarRouteLink>
              </div>
            </Card>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
