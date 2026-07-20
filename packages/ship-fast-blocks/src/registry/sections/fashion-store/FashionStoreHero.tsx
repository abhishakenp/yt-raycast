import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FashionStoreHero — full-bleed Vogue-cover image hero for a luxury fashion
 * store. A tall (85vh) editorial photograph under layered foreground scrims and
 * a giant ghost serif watermark, composed as a magazine cover: a mono season
 * masthead row pinned to the top, and a lower-left coverline block carrying a
 * hairline rule, an oversized serif two-line display headline, a light
 * supporting paragraph, and dual square CTAs (a solid light primary + a
 * hairline-outline ghost). Both CTAs route through section-kit route links and
 * the background uses the alt-driven Image component. Use as the opening hero
 * for clothing brands, boutiques, lookbook commerce, or any premium
 * quiet-luxury storefront.
 */
export const FashionStoreHero = defineCapsule({
  name: 'FashionStoreHero',
  description:
    'Full-bleed Vogue-cover image hero for a luxury fashion store: a tall (85vh) editorial photograph under layered foreground scrims and a giant ghost serif watermark, composed as a magazine cover — a mono season masthead row pinned to the top and a lower-left coverline block carrying a hairline rule, an oversized serif two-line display headline, a light supporting paragraph, and dual square CTAs (a solid light primary + a hairline-outline ghost). Both CTAs route through section-kit route links and the background uses the alt-driven Image component. Use as the opening hero for clothing brands, boutiques, apparel shops, lookbook commerce, or any premium quiet-luxury storefront.',
  lakebed: commerceCartLakebed,
  props: z.object({
    eyebrow: z.string().optional(),
    /** Heading lines rendered stacked. */
    headingTop: z.string().optional(),
    headingBottom: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    featuredName: z.string().optional(),
    featuredPrice: z.string().optional(),
    featuredVariant: z.string().optional(),
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const heroEyebrow = props.eyebrow ?? 'Spring/Summer 2025'
    const heroTop = props.headingTop ?? 'The Quiet'
    const heroBottom = props.headingBottom ?? 'Luxury Edit'
    const heroSub =
      props.subheading ??
      'Timeless essentials crafted for the modern wardrobe. Discover our curated collection of elevated basics.'
    const heroPrimary = props.primaryCta ?? 'Shop the Collection'
    const heroSecondary = props.secondaryCta ?? 'View Lookbook'
    const heroImageAlt =
      props.imageAlt ??
      'Editorial fashion photograph of model in flowing beige coat walking on minimalist concrete architecture'
    const featuredName = props.featuredName ?? 'Quiet Luxury Capsule'
    const featuredPrice = props.featuredPrice ?? '$485'
    const featuredVariant = props.featuredVariant ?? heroEyebrow
    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt: heroImageAlt,
        label: featuredName,
        price: featuredPrice,
        subtitle: featuredVariant,
      }),
    ])

    return (
      <HeroSection
        aria-label="Hero"
        variant="default"
        className={cn('pt-16 lg:pt-20', props.className)}
      >
        <div className="relative h-[85vh] max-h-[900px] min-h-[600px] overflow-hidden">
          <Image
            alt={heroImageAlt}
            w={1920}
            h={1080}
            className="absolute inset-0 size-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-foreground/20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-foreground/15"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[0.14em] left-[-0.03em] select-none font-serif text-[30vw] font-normal leading-none tracking-tighter text-background/10"
          >
            Mode
          </span>

          <div className="absolute inset-0 flex flex-col justify-between px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
            <div className="flex items-start justify-between gap-4 text-background">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em]">
                {heroEyebrow}
              </p>
              <span
                aria-hidden="true"
                className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.28em] text-background/70 sm:block"
              >
                N° 01 — Editorial
              </span>
            </div>

            <HeroContent className="max-w-3xl text-background">
              <div
                aria-hidden="true"
                className="mb-6 h-px w-16 bg-background/60"
              />
              <h1 className="font-serif text-5xl font-normal leading-[0.92] tracking-tight sm:text-6xl lg:text-8xl">
                {heroTop}
                <br />
                {heroBottom}
              </h1>
              <p className="mt-6 max-w-md text-base font-light leading-relaxed text-background/90 sm:text-lg">
                {heroSub}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none bg-background px-8 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground transition-[background-color,transform] duration-150 hover:bg-background/90 active:translate-y-px"
                  href={heroPrimary}
                >
                  {heroPrimary}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border border-background/70 px-8 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-background transition-[background-color,color,transform] duration-150 hover:bg-background hover:text-foreground active:translate-y-px"
                  href={heroSecondary}
                >
                  {heroSecondary}
                </NavbarRouteLink>
              </div>
              <CommerceAddItemButton
                lakebed={lakebed}
                item={{ label: featuredName, price: featuredPrice }}
                aria-label={`Add ${featuredName} to cart`}
                pendingChildren={
                  <>
                    <CommerceMutationSpinner />
                    Adding
                  </>
                }
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-none border border-background/50 px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background transition-[background-color,color,transform] duration-150 hover:bg-background hover:text-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
              >
                Add capsule · {featuredPrice}
              </CommerceAddItemButton>
            </HeroContent>
          </div>
        </div>
      </HeroSection>
    )
  },
})
