import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * EcommerceHero — editorial-commerce opening spread for a general online
 * store. An asymmetric 7:5 split over a giant ghost "SHOP" watermark: on the
 * left a mono sale eyebrow with a primary tick and hairline rule, an oversized
 * extrabold tight-tracked headline, a supporting subheading, and a square CTA
 * row (ink-filled primary, hairline outline secondary, and a hard-offset-shadow
 * add-to-cart button wired to the shared Lakebed cart); on the right a sharp
 * hairline-framed product plate on an offset frame with a rotated discount
 * sticker and an overlapping price plaque carrying the product name in mono and
 * a giant tabular price. A hairline-bounded mono ticker strip of trust items
 * (indexed, uppercase) closes the band. Every CTA routes through section-kit
 * route links and the product photo uses the alt-driven Image component. Use as
 * the opening hero for general retail storefronts, marketplaces, deal/sale
 * landing pages, or any promotional online shop that wants a sharp editorial
 * text + product-plate split rather than a soft rounded card.
 */
export const EcommerceHero = defineCapsule({
  name: 'EcommerceHero',
  description:
    "Editorial-commerce opening spread for a general online store: an asymmetric 7:5 split over a giant ghost 'SHOP' watermark, with a mono sale eyebrow + hairline rule, an oversized extrabold tight-tracked headline, a supporting subheading, and a square CTA row (ink-filled primary, hairline outline secondary, hard-offset-shadow add-to-cart wired to the shared Lakebed cart) on the left, plus a sharp hairline-framed product plate on an offset frame with a rotated discount sticker and an overlapping plaque carrying the mono product name and a giant tabular price on the right; a hairline-bounded mono ticker strip of indexed trust items closes the band. Every CTA routes through section-kit route links and the product photo uses the alt-driven Image component. Use as the opening hero for general retail storefronts, marketplaces, deal/sale landing pages, or any promotional online shop.",
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
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Watermark className="right-[-0.08em] top-2 text-[clamp(7rem,17vw,15rem)] uppercase">
          Shop
        </Watermark>

        <Container className="relative grid items-center gap-12 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <HeroBadge
                variant="solid"
                className="shrink-0 gap-2 rounded-none bg-transparent px-0 py-0 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                {heroEyebrow}
              </HeroBadge>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <span
                aria-hidden="true"
                className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60 sm:inline"
              >
                01 / Storefront
              </span>
            </div>

            <HeroHeading className="mt-7 max-w-2xl text-[clamp(2.5rem,5.5vw,4.75rem)] font-extrabold leading-[0.95] tracking-tighter">
              {heroHeading}
            </HeroHeading>
            <HeroSubheading className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
              {heroSub}
            </HeroSubheading>

            <HeroActions className="mt-9 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
              <HeroCta
                asChild
                variant="none"
                className="inline-flex items-center justify-center rounded-none bg-foreground px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px"
              >
                <NavbarRouteLink href={heroPrimary}>
                  {heroPrimary}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="none"
                className="inline-flex items-center justify-center rounded-none border border-foreground/25 bg-transparent px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-150 hover:border-foreground active:translate-y-px"
              >
                <NavbarRouteLink href={heroSecondary}>
                  {heroSecondary}
                </NavbarRouteLink>
              </HeroCta>
              <CommerceAddItemButton
                lakebed={lakebed}
                item={{
                  label: featuredProductName,
                  price: featuredProductPrice,
                }}
                aria-label={`${addLabel} ${featuredProductName}`}
                pendingChildren={<CommerceMutationSpinner />}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-none border border-foreground bg-background px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground shadow-[4px_4px_0_0] shadow-foreground/20 transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0] hover:shadow-foreground/20 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-70 sm:col-span-1"
              >
                {addLabel}
              </CommerceAddItemButton>
            </HeroActions>
          </div>

          <div className="relative mb-8 mr-3 lg:col-span-5 lg:mr-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-foreground/20"
            />
            <HeroMediaPanel
              alt={heroImageAlt}
              w={1200}
              h={1200}
              className="relative rounded-none border border-foreground/15 bg-muted"
            />
            <div className="absolute -top-3 right-3 rotate-2 border border-foreground bg-background px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-[4px_4px_0_0] shadow-primary/30">
              {heroBadge}
            </div>
            <div className="absolute -bottom-8 left-4 border border-foreground bg-background px-5 py-3 shadow-[6px_6px_0_0] shadow-foreground/15">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {featuredProductSubtitle} · {featuredProductName}
              </p>
              <p className="mt-1 text-4xl font-extrabold leading-none tracking-tighter text-foreground tabular-nums sm:text-5xl">
                {featuredProductPrice}
              </p>
            </div>
          </div>
        </Container>

        <div className="relative border-t border-border">
          <Container>
            <HeroSocialProof className="mt-0 grid grid-cols-1 gap-0 divide-y divide-border font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground sm:flex sm:flex-wrap sm:items-center sm:gap-x-0 sm:gap-y-0 sm:divide-y-0">
              {heroTrust.filter(Boolean).map((item, i) => (
                <HeroSocialProofItem
                  key={item}
                  className="flex items-center gap-3 py-3.5 sm:border-r sm:border-border sm:pr-8 sm:last:border-r-0 sm:[&:not(:first-child)]:pl-8"
                >
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground/50 tabular-nums"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item}
                </HeroSocialProofItem>
              ))}
            </HeroSocialProof>
          </Container>
        </div>
      </HeroSection>
    )
  },
})
