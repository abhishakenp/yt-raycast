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
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * WineryBreweryHero — full-bleed, image-forward, artisan-editorial hero for a
 * winery, vineyard, or craft brewery landing page. A single golden-hour
 * vineyard / taproom photograph fills the band edge to edge under a token-based
 * dark overlay so warm serif text reads cleanly on top, with a giant faint
 * ghost watermark word bleeding off one corner. Left-aligned content leads with
 * a mono index rail + a square hairline label-stamp eyebrow, then a large serif
 * headline, a supporting paragraph, three square-edged CTAs (filled "Visit Us"
 * + outlined translucent "Our Wines" + a Lakebed add-to-cart), and a
 * divider-separated hours / location / phone meta strip. CTAs route through
 * section-kit route links; the add button seeds the shared tasting catalog and
 * cart. Use as the opening hero for wineries, cellar doors, vineyards,
 * breweries, taprooms, or cideries. Renders fully with no props.
 */
export const WineryBreweryHero = defineCapsule({
  name: 'WineryBreweryHero',
  description:
    "Full-bleed image-forward, artisan-editorial hero for a winery / vineyard / craft brewery landing page: one golden-hour vineyard or taproom photo fills the band edge to edge under a token-based dark overlay with a giant faint ghost watermark word, so warm serif text stays readable. Left-aligned content leads with a mono index rail and a square hairline label-stamp eyebrow, then a large serif headline, a supporting paragraph, three square-edged CTAs (filled 'Visit Us' + outlined translucent 'Our Wines' + a Lakebed add-to-cart), and a divider-separated hours / location / phone meta strip. CTAs route through section-kit route links. Use as the opening hero for wineries, cellar doors, vineyards, breweries, taprooms, or cideries.",
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
    featuredItemName: z.string().optional(),
    featuredItemPrice: z.string().optional(),
    featuredItemSubtitle: z.string().optional(),
    addLabel: z.string().optional(),
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
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const heroEyebrow = props.eyebrow ?? 'Estate-grown · Est. 1986'
    const heroHeading = props.heading ?? 'Where the vineyard meets the glass'
    const heroSub =
      props.subheading ??
      'A family estate crafting small-batch wines and barrel-aged ales on the same sun-soaked hillside for nearly forty years. Wander the rows, tour the cellar, and taste the seasons poured straight from the source.'
    const heroPrimary = props.primaryCta ?? 'Visit Us'
    const heroPrimaryTarget = props.primaryTarget ?? 'Visit'
    const heroSecondary = props.secondaryCta ?? 'Our Wines'
    const heroSecondaryTarget = props.secondaryTarget ?? 'Wines'
    const featuredItemName = props.featuredItemName ?? 'Estate Tasting Flight'
    const featuredItemPrice = props.featuredItemPrice ?? '$28'
    const featuredItemSubtitle =
      props.featuredItemSubtitle ?? 'Guided flight · tasting room'
    const addLabel = props.addLabel ?? 'Add to cart'
    const heroImageAlt =
      props.imageAlt ??
      'rolling hillside vineyard rows glowing at golden hour with an old stone winery and oak barrels in the foreground'
    const heroHours = props.hours ?? 'Tasting room · Thu–Sun · 11am–6pm'
    const heroLocation = props.location ?? '4200 Vineyard Lane, Sonoma Valley'
    const heroPhone = props.phone ?? '(707) 555-0148'

    const infoItems = [heroHours, heroLocation, heroPhone].filter(Boolean)

    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt: heroImageAlt,
        label: featuredItemName,
        price: featuredItemPrice,
        subtitle: featuredItemSubtitle,
      }),
    ])

    return (
      <HeroSection variant="full-bleed" className={props.className}>
        <HeroBackgroundImage
          alt={heroImageAlt}
          overlayClassName="bg-foreground/60"
          gradientClassName="bg-gradient-to-tr from-foreground/80 via-foreground/35 to-foreground/25"
        />

        {/* Giant faint ghost watermark word, bleeding off the corner. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -right-6 select-none font-serif text-[7rem] font-medium italic leading-none tracking-tight text-background/[0.06] sm:text-[11rem] lg:-bottom-16 lg:text-[16rem]"
        >
          Cellar
        </span>

        <Container asChild>
          <HeroContent className="flex flex-col items-start pb-24 pt-36 text-left sm:pt-40 lg:pb-32 lg:pt-48">
            {/* Mono index rail. */}
            <div className="flex w-full max-w-md items-center gap-4 text-background/70">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
                Vol. 01
              </span>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-background/25"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
                Estate
              </span>
            </div>

            <HeroBadge
              variant="pill"
              className="mt-6 -rotate-1 rounded-none border-background/40"
            >
              {heroEyebrow}
            </HeroBadge>

            <HeroHeading variant="serif" className="max-w-4xl">
              {heroHeading}
            </HeroHeading>

            <HeroSubheading variant="light">{heroSub}</HeroSubheading>

            <HeroActions className="mt-10 w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-none px-8 py-4 font-medium transition-transform duration-150 active:translate-y-px"
              >
                <NavbarRouteLink href={heroPrimaryTarget}>
                  {heroPrimary}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-none border-background/50 bg-card/10 px-8 py-4 font-medium text-background backdrop-blur-sm transition-transform duration-150 hover:bg-card/20 active:translate-y-px"
              >
                <NavbarRouteLink href={heroSecondaryTarget}>
                  {heroSecondary}
                </NavbarRouteLink>
              </HeroCta>
              <CommerceAddItemButton
                lakebed={lakebed}
                item={{
                  label: featuredItemName,
                  price: featuredItemPrice,
                }}
                aria-label={`${addLabel} ${featuredItemName}`}
                pendingChildren={<CommerceMutationSpinner />}
                className="inline-flex items-center justify-center rounded-none bg-background px-8 py-4 font-medium text-foreground transition-[transform,background-color] duration-150 hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
              >
                {addLabel}
              </CommerceAddItemButton>
            </HeroActions>

            <div className="mt-14 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-background/75">
              {infoItems.map((item, i) => (
                <div key={item} className="flex items-center gap-x-4">
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-3 w-px bg-background/30 sm:block"
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
