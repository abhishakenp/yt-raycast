import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * EcommerceHero — promotional split hero for a general online store. A two-column
 * (lg:grid-cols-2) layout: on the left a sale eyebrow pill, an oversized bold sans
 * headline, a supporting subheading, dual CTAs (a solid primary "Shop now" + an
 * outlined "Explore"), and a small trust row (free shipping · easy returns · secure
 * checkout); on the right a large hero product Image in a rounded muted card with a
 * floating price/discount badge overlay. Every CTA routes through useNavigate and the
 * product photo uses the alt-driven Image component. Use as the opening hero for
 * general retail storefronts, marketplaces, deal/sale landing pages, or any
 * promotional online shop that wants a balanced text + product-photo split rather
 * than a full-bleed editorial image.
 */
export const EcommerceHero = defineCapsule({
  name: 'EcommerceHero',
  description:
    "Promotional split hero for a general online store: a two-column (lg:grid-cols-2) layout with a sale eyebrow pill, an oversized bold sans headline, a supporting subheading, dual CTAs (a solid primary 'Shop now' + an outlined 'Explore'), and a small trust row on the left, plus a large hero product Image in a rounded muted card with a floating price/discount badge overlay on the right. Every CTA routes through useNavigate and the product photo uses the alt-driven Image component. Use as the opening hero for general retail storefronts, marketplaces, deal/sale landing pages, or any promotional online shop that wants a balanced text + product-photo split rather than a full-bleed editorial image.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    featuredProductName: z.string().optional(),
    featuredProductPrice: z.string().optional(),
    featuredProductSubtitle: z.string().optional(),
    addLabel: z.string().optional(),
    imageAlt: z.string().optional(),
    badgeText: z.string().optional(),
    trust: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heroEyebrow = props.eyebrow ?? 'Summer Sale — Up to 50% Off'
    const heroHeading = props.heading ?? 'Everything you love, now for less'
    const heroSub =
      props.subheading ??
      'Shop thousands of top-rated products across every category. Fresh drops weekly, fast delivery, and prices you will actually love.'
    const heroPrimary = props.primaryCta ?? 'Shop now'
    const heroSecondary = props.secondaryCta ?? 'Explore'
    const featuredProductName =
      props.featuredProductName ?? 'Wireless Headphones'
    const featuredProductPrice = props.featuredProductPrice ?? '$129'
    const featuredProductSubtitle =
      props.featuredProductSubtitle ?? 'Featured deal'
    const addLabel = props.addLabel ?? 'Add to cart'
    const heroImageAlt =
      props.imageAlt ??
      'Modern retail product flat-lay featuring a stylish gadget, accessories, and packaging on a clean neutral background'
    const heroBadge = props.badgeText ?? 'Save 40%'
    const heroTrust = props.trust ?? [
      'Free shipping',
      'Easy returns',
      'Secure checkout',
    ]

    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt: heroImageAlt,
        label: featuredProductName,
        price: featuredProductPrice,
        subtitle: featuredProductSubtitle,
      }),
    ])

    return (
      <HeroSection
        aria-label="Hero"
        className={cn('bg-background', props.className)}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div className="text-center lg:text-left">
            <HeroBadge variant="solid">{heroEyebrow}</HeroBadge>
            <HeroHeading className="mt-6">{heroHeading}</HeroHeading>
            <HeroSubheading className="mx-auto mt-6 max-w-xl lg:mx-0">
              {heroSub}
            </HeroSubheading>
            <HeroActions className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="w-full rounded-lg bg-primary px-8 py-4 text-sm font-semibold tracking-wide text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
              >
                {heroPrimary}
              </button>
              <button
                type="button"
                onClick={() => go(heroSecondary)}
                className="w-full rounded-lg border border-border px-8 py-4 text-sm font-semibold tracking-wide text-foreground transition-colors hover:bg-muted sm:w-auto"
              >
                {heroSecondary}
              </button>
              <CommerceAddItemButton
                lakebed={lakebed}
                item={{
                  label: featuredProductName,
                  price: featuredProductPrice,
                }}
                aria-label={`${addLabel} ${featuredProductName}`}
                pendingChildren={<CommerceMutationSpinner />}
                className="inline-flex w-full items-center justify-center rounded-lg bg-foreground px-8 py-4 text-sm font-semibold tracking-wide text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-70 sm:w-auto"
              >
                {addLabel}
              </CommerceAddItemButton>
            </HeroActions>
            <HeroSocialProof className="justify-center lg:justify-start">
              {heroTrust.filter(Boolean).map((item) => (
                <HeroSocialProofItem key={item}>
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-accent"
                  />
                  {item}
                </HeroSocialProofItem>
              ))}
            </HeroSocialProof>
          </div>

          <div className="relative">
            <HeroMediaPanel
              alt={heroImageAlt}
              w={1200}
              h={1200}
              rounded="2xl"
              className="bg-muted"
            />
            <div className="absolute right-4 top-4 rounded-xl bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-lg sm:right-6 sm:top-6">
              {heroBadge}
            </div>
          </div>
        </div>
      </HeroSection>
    )
  },
})
