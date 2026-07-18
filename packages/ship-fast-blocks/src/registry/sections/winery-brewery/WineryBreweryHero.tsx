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
} from '#/section-kit/HeroSection.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * WineryBreweryHero — full-bleed, image-forward hero for a winery, vineyard, or
 * craft brewery landing page. A single golden-hour vineyard / taproom
 * photograph fills the band edge to edge with a token-based dark overlay so
 * light, serif text reads cleanly on top. Centered content stacks an uppercase
 * eyebrow pill, a large serif headline, a supporting paragraph, dual CTAs
 * (filled "Visit Us" + outlined "Our Wines"), and a divider-separated hours /
 * location / phone strip beneath. CTAs route through useNavigate. Use as the
 * opening hero for wineries, cellar doors, vineyards, breweries, taprooms, or
 * cideries. Renders fully with no props via rustic-premium baked-in defaults.
 */
export const WineryBreweryHero = defineCapsule({
  name: 'WineryBreweryHero',
  description:
    "Full-bleed image-forward hero for a winery / vineyard / craft brewery landing page: one golden-hour vineyard or taproom photo fills the band edge to edge under a token-based dark overlay so light serif text stays readable. Centered content has an uppercase eyebrow pill, a large serif headline, a supporting paragraph, dual CTAs (filled 'Visit Us' + outlined translucent 'Our Wines'), and a divider-separated hours / location / phone strip. CTAs route through useNavigate. Use as the opening hero for wineries, cellar doors, vineyards, breweries, taprooms, or cideries.",
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
    const go = useNavigate()
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
          gradientClassName="bg-gradient-to-t from-foreground/70 via-foreground/30 to-foreground/50"
        />

        <HeroContent className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-28 pt-36 text-center sm:pt-40 lg:px-8 lg:pb-32 lg:pt-48">
          <HeroBadge variant="pill">{heroEyebrow}</HeroBadge>

          <HeroHeading variant="serif">{heroHeading}</HeroHeading>

          <HeroSubheading variant="light">{heroSub}</HeroSubheading>

          <HeroActions className="mt-10 flex-col gap-4 sm:flex-row">
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
            <CommerceAddItemButton
              lakebed={lakebed}
              item={{
                label: featuredItemName,
                price: featuredItemPrice,
              }}
              aria-label={`${addLabel} ${featuredItemName}`}
              pendingChildren={<CommerceMutationSpinner />}
              className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-background/90 disabled:pointer-events-none disabled:opacity-70"
            >
              {addLabel}
            </CommerceAddItemButton>
          </HeroActions>

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
        </HeroContent>
      </HeroSection>
    )
  },
})
