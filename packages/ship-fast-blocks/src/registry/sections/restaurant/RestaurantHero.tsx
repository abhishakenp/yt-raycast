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
  HeroInfoStrip,
  HeroInfoStripItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  RestaurantMutationSpinner,
  RestaurantReservationButton,
} from './restaurant-interactions.tsx'
import { restaurantLakebed } from './restaurant-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * RestaurantHero — full-bleed, image-forward menu-editorial hero for a
 * restaurant landing page. A single appetizing food / dining-room photograph
 * fills the band edge to edge under a token-based dark overlay so light serif
 * text reads cleanly on top. Left-aligned content stacks a rotated hairline
 * mono "stamp" eyebrow, a large warm serif headline, a supporting paragraph,
 * dual square-edged CTAs with press feedback (filled "Reserve a Table" +
 * hairline-outlined translucent "View Menu"), and a hairline-ruled mono
 * hours / location / phone ledger strip beneath. CTAs route through section-kit
 * route links. Use as the opening hero for casual or upscale restaurants,
 * bistros, eateries, fine-dining rooms, and chef-driven venues. Renders fully
 * with no props via baked-in defaults.
 */
export const RestaurantHero = defineCapsule({
  name: 'RestaurantHero',
  description:
    "Full-bleed image-forward menu-editorial hero for a restaurant landing page: one appetizing food / dining-room photo fills the band edge to edge under a token-based dark overlay so light serif text stays readable. Left-aligned content has a rotated hairline mono 'stamp' eyebrow, a large warm serif headline, a supporting paragraph, dual square-edged CTAs with press feedback (filled 'Reserve a Table' + hairline-outlined translucent 'View Menu'), and a hairline-ruled mono hours / location / phone ledger strip. CTAs route through section-kit route links. Use as the opening hero for casual or upscale restaurants, bistros, eateries, fine-dining rooms, and chef-driven venues.",
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
      <HeroSection variant="full-bleed" className={props.className}>
        <HeroBackgroundImage
          alt={heroImageAlt}
          overlayClassName="bg-foreground/60"
          gradientClassName="bg-gradient-to-t from-foreground/70 via-foreground/30 to-foreground/50"
        />

        <Container asChild>
          <HeroContent className="flex max-w-3xl flex-col items-start pb-24 pt-36 text-left sm:pt-40 lg:pb-32 lg:pt-48">
            <HeroBadge
              variant="pill"
              className="rotate-[-1.5deg] rounded-none border-background/50 bg-transparent px-3 py-1 font-mono tracking-[0.28em] backdrop-blur-none"
            >
              {heroEyebrow}
            </HeroBadge>

            <HeroHeading
              variant="serif"
              className="mt-6 text-balance sm:text-6xl lg:text-7xl"
            >
              {heroHeading}
            </HeroHeading>

            <HeroSubheading variant="light">{heroSub}</HeroSubheading>

            <HeroActions className="mt-10 w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <RestaurantReservationButton
                lakebed={lakebed}
                input={{ label: heroPrimary, source: heroPrimaryTarget }}
                className="inline-flex items-center justify-center rounded-none bg-primary px-8 py-4 font-medium text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px"
                pendingChildren={<RestaurantMutationSpinner />}
              >
                {heroPrimary}
              </RestaurantReservationButton>
              <HeroCta
                asChild
                className="inline-flex items-center justify-center rounded-none border border-background/40 bg-background/5 px-8 py-4 font-medium text-background backdrop-blur-sm transition-[background-color,transform] duration-150 hover:bg-background/15 active:translate-y-px"
              >
                <NavbarRouteLink href={heroSecondaryTarget}>
                  {heroSecondary}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>

            <HeroInfoStrip className="mt-12 justify-start gap-0 border-t border-background/25 pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-background/70">
              {infoItems.map((item) => (
                <HeroInfoStripItem
                  key={item}
                  className="gap-0 py-1 pr-5 sm:border-r sm:border-background/20 sm:pl-5 sm:first:pl-0"
                >
                  <span>{item}</span>
                </HeroInfoStripItem>
              ))}
            </HeroInfoStrip>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
