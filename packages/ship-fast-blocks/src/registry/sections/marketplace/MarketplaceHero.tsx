import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import {
  HeroStatBadge,
  HeroStatBadgeIcon,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * MarketplaceHero — a split, two-column marketplace hero. The left column stacks
 * a live "products added this week" status pill (pulsing dot), a large
 * tracking-tight headline with a muted-color highlight phrase, a supporting
 * paragraph, dual CTAs (filled Explore-Products + outlined Start-Selling), and a
 * trust row (secure-payments / fast-shipping / buyer-protection with inline
 * icons); the right column is a staggered 4-image product collage in rounded
 * tiles with a floating "Verified Seller" badge card. Clean, neutral, light
 * e-commerce aesthetic. CTAs route through useNavigate; collage uses alt-driven
 * Image. Use as the top hero for online marketplaces, multi-vendor or
 * maker/artisan platforms, and shopping destinations.
 */
export const MarketplaceHero = defineCapsule({
  name: 'MarketplaceHero',
  description:
    "Split, two-column marketplace hero: the left column stacks a live 'products added this week' status pill with a pulsing dot, a large tracking-tight headline with a muted-color highlight phrase, a supporting paragraph, dual CTAs (filled Explore-Products + outlined Start-Selling), and a trust row (secure-payments / fast-shipping / buyer-protection with inline icons); the right column is a staggered 4-image product collage in rounded tiles with a floating 'Verified Seller' badge card. Clean, neutral, light e-commerce aesthetic. CTAs route through useNavigate; the collage uses the alt-driven Image component. Use as the top hero for online marketplaces, multi-vendor or maker/artisan platforms, and shopping destinations.",
  props: z.object({
    badge: z.string().optional(),
    /** Heading lead rendered in full-strength text. */
    headingLead: z.string().optional(),
    /** Phrase rendered in muted highlight color. */
    highlight: z.string().optional(),
    /** Heading tail after the highlight. */
    headingTail: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    featuredProductName: z.string().optional(),
    featuredProductPrice: z.string().optional(),
    featuredProductSubtitle: z.string().optional(),
    addLabel: z.string().optional(),
    /** Trust signals beneath the hero copy. */
    trust: z.array(z.string()).optional(),
    /** Alt text for the 4 collage product images. */
    gallery: z.array(z.string()).optional(),
    badgeTitle: z.string().optional(),
    badgeSubtitle: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heroBadge = props.badge ?? '12,847 products added this week'
    const headingLead = props.headingLead ?? 'Discover unique products from'
    const heroHighlight = props.highlight ?? 'verified sellers'
    const headingTail = props.headingTail ?? 'worldwide'
    const heroSub =
      props.subheading ??
      'Join over 2 million shoppers buying directly from independent artisans, designers, and small businesses. Quality goods, fair prices, no middlemen.'
    const heroPrimary = props.primaryCta ?? 'Explore Products'
    const heroSecondary = props.secondaryCta ?? 'Start Selling'
    const featuredProductName =
      props.featuredProductName ?? 'Verified Artisan Bundle'
    const featuredProductPrice = props.featuredProductPrice ?? '$64'
    const featuredProductSubtitle =
      props.featuredProductSubtitle ?? 'Featured marketplace pick'
    const addLabel = props.addLabel ?? 'Add to cart'
    const heroTrust = props.trust?.length
      ? props.trust
      : ['Secure payments', 'Fast shipping', 'Buyer protection']
    const heroGallery = props.gallery?.length
      ? props.gallery
      : [
          'Modern minimalist watch with leather strap on white surface',
          'Premium wireless headphones with sleek design on gray background',
          'Vibrant red running shoe with white sole on white background',
          'Classic sunglasses with black frames and dark lenses',
        ]
    const heroBadgeTitle = props.badgeTitle ?? 'Verified Seller'
    const heroBadgeSubtitle = props.badgeSubtitle ?? 'Artisan Collective'

    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt: heroGallery[0] ?? featuredProductName,
        label: featuredProductName,
        price: featuredProductPrice,
        subtitle: featuredProductSubtitle,
      }),
    ])

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className ?? 'size-4'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const trustIcons: ReactNode[] = [
      <svg
        key="shield"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      <svg
        key="clock"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="card"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>,
    ]

    const galleryAspect = [
      'aspect-[4/5]',
      'aspect-square',
      'aspect-square',
      'aspect-[4/5]',
    ]

    return (
      <HeroSection
        variant="split"
        className={cn('border-b border-border bg-background', props.className)}
        aria-labelledby="hero-heading"
      >
        <Container size="xl" className="py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                {heroBadge}
              </div>
              <h1
                id="hero-heading"
                className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                {headingLead}{' '}
                <span className="text-muted-foreground">{heroHighlight}</span>{' '}
                {headingTail}
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                {heroSub}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <span>{heroPrimary}</span>
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-input px-6 py-3.5 font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span>{heroSecondary}</span>
                </button>
                <CommerceAddItemButton
                  lakebed={lakebed}
                  item={{
                    label: featuredProductName,
                    price: featuredProductPrice,
                  }}
                  aria-label={`${addLabel} ${featuredProductName}`}
                  pendingChildren={<CommerceMutationSpinner />}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3.5 font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  <span>{addLabel}</span>
                </CommerceAddItemButton>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
                {heroTrust.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    {trustIcons[i % trustIcons.length]}
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  {[0, 1].map((idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'overflow-hidden rounded-2xl bg-muted',
                        galleryAspect[idx],
                      )}
                    >
                      <Image
                        alt={heroGallery[idx] ?? 'Featured marketplace product'}
                        w={600}
                        h={idx === 0 ? 750 : 600}
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-4 pt-8">
                  {[2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'overflow-hidden rounded-2xl bg-muted',
                        galleryAspect[idx],
                      )}
                    >
                      <Image
                        alt={heroGallery[idx] ?? 'Featured marketplace product'}
                        w={600}
                        h={idx === 3 ? 750 : 600}
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <HeroStatBadge className="absolute -bottom-4 -left-4 flex items-center gap-3">
                <HeroStatBadgeIcon className="size-10 rounded-full bg-primary/10 text-primary">
                  <Check className="size-5" />
                </HeroStatBadgeIcon>
                <HeroStatBadgeContent>
                  <HeroStatBadgeTitle className="text-sm font-semibold">
                    {heroBadgeTitle}
                  </HeroStatBadgeTitle>
                  <HeroStatBadgeSubtitle className="text-xs">
                    {heroBadgeSubtitle}
                  </HeroStatBadgeSubtitle>
                </HeroStatBadgeContent>
              </HeroStatBadge>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
