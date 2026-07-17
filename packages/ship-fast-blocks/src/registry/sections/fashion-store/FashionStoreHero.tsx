import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * FashionStoreHero — full-bleed editorial image hero for a minimalist fashion
 * store. A tall (85vh) background photograph with a subtle foreground scrim,
 * centered over it a wide uppercase tracked season eyebrow, an oversized serif
 * two-line display headline, a light supporting paragraph, and dual CTAs
 * (a solid light primary button + an outlined ghost button). Both CTAs route
 * through useNavigate and the background uses the alt-driven Image component.
 * Use as the opening hero for clothing brands, boutiques, lookbook commerce,
 * or any premium quiet-luxury storefront.
 */
export const FashionStoreHero = defineCapsule({
  name: 'FashionStoreHero',
  description:
    'Full-bleed editorial image hero for a minimalist fashion store: a tall (85vh) background photograph with a subtle foreground scrim, centered over it a wide uppercase tracked season eyebrow, an oversized serif two-line display headline, a light supporting paragraph, and dual CTAs (a solid light primary button + an outlined ghost button). Both CTAs route through useNavigate and the background uses the alt-driven Image component. Use as the opening hero for clothing brands, boutiques, apparel shops, lookbook commerce, or any premium quiet-luxury storefront.',
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
    const go = useNavigate()
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
        <div className="relative h-[85vh] max-h-[900px] min-h-[600px]">
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
          <div className="absolute inset-0 flex items-center justify-center">
            <HeroContent className="max-w-4xl px-4 text-center text-background">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] sm:text-base">
                {heroEyebrow}
              </p>
              <h1 className="mb-6 font-serif text-5xl font-normal leading-none sm:text-6xl lg:text-8xl">
                {heroTop}
                <br />
                {heroBottom}
              </h1>
              <p className="mx-auto mb-10 max-w-xl text-lg font-light text-background/90 sm:text-xl">
                {heroSub}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="bg-background px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-muted"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="border border-background px-8 py-4 text-sm font-medium tracking-wide text-background transition-colors hover:bg-background hover:text-foreground"
                >
                  {heroSecondary}
                </button>
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
                className="mx-auto mt-5 inline-flex items-center justify-center gap-2 border border-background/60 px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-background transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-70"
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
