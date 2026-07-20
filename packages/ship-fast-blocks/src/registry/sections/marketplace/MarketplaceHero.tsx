import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MarketplaceHero — editorial commerce-index opening spread for a multi-vendor
 * marketplace. An asymmetric 7:5 split over a giant ghost "MARKET" watermark:
 * on the left a mono index eyebrow rule (primary tick + live "products added"
 * count + hairline), an oversized extrabold tight-tracked headline with a muted
 * highlight phrase, a supporting subheading, and a square CTA row (ink-filled
 * primary, hairline outline secondary, and a hard-offset-shadow add-to-cart
 * button wired to the shared Lakebed cart), closed by a hairline-bounded mono
 * ticker strip of indexed trust items; on the right a staggered 2×2 grid of
 * sharp hairline-framed product plates on offset frames, an overlapping ink
 * price plaque carrying the featured product name (mono) + a giant tabular
 * price, and a square "Verified Seller" badge chip. Every CTA routes through
 * section-kit route links and every collage image uses the alt-driven Image
 * component. Use as the top hero for online marketplaces, multi-vendor or
 * maker/artisan platforms, and shopping destinations.
 */
export const MarketplaceHero = defineCapsule({
  name: 'MarketplaceHero',
  description:
    "Editorial commerce-index opening spread for a multi-vendor marketplace: an asymmetric 7:5 split over a giant ghost 'MARKET' watermark, with a mono index eyebrow rule (primary tick + live 'products added' count + hairline), an oversized extrabold tight-tracked headline with a muted highlight phrase, a supporting subheading, and a square CTA row (ink-filled primary, hairline outline secondary, hard-offset-shadow add-to-cart wired to the shared Lakebed cart) closed by a hairline mono ticker strip of indexed trust items on the left, plus a staggered 2×2 grid of sharp hairline-framed product plates on offset frames, an overlapping ink price plaque (mono product name + giant tabular price), and a square 'Verified Seller' badge chip on the right. Every CTA routes through section-kit route links and the collage uses the alt-driven Image component. Use as the top hero for online marketplaces, multi-vendor or maker/artisan platforms, and shopping destinations.",
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

    const galleryAspect = [
      'aspect-[4/5]',
      'aspect-square',
      'aspect-square',
      'aspect-[4/5]',
    ]

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
        aria-labelledby="hero-heading"
      >
        <Watermark className="-right-[0.06em] top-4 text-[clamp(6rem,15vw,14rem)] uppercase">
          Market
        </Watermark>

        <Container
          size="xl"
          className="relative grid items-center gap-12 py-14 lg:grid-cols-12 lg:gap-14 lg:py-24"
        >
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span className="flex shrink-0 items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                {heroBadge}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <span
                aria-hidden="true"
                className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/60 sm:inline"
              >
                01 / Index
              </span>
            </div>

            <h1
              id="hero-heading"
              className="mt-7 max-w-2xl text-[clamp(2.5rem,5.4vw,4.75rem)] font-extrabold leading-[0.95] tracking-tighter text-foreground"
            >
              {headingLead}{' '}
              <span className="text-muted-foreground">{heroHighlight}</span>{' '}
              {headingTail}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {heroSub}
            </p>

            <div className="mt-9 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-foreground px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px"
                href={heroPrimary}
              >
                {heroPrimary}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-foreground/25 bg-transparent px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-150 hover:border-foreground active:translate-y-px"
                href={heroSecondary}
              >
                {heroSecondary}
              </NavbarRouteLink>
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
                <span>{addLabel}</span>
              </CommerceAddItemButton>
            </div>

            <ul className="mt-10 grid grid-cols-1 divide-y divide-border border-t border-border font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground sm:flex sm:flex-wrap sm:divide-y-0 sm:border-t-0">
              {heroTrust.map((label, i) => (
                <li
                  key={label}
                  className="flex items-center gap-3 py-3.5 sm:border-r sm:border-border sm:pr-8 sm:last:border-r-0 sm:[&:not(:first-child)]:pl-8"
                >
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground/50 tabular-nums"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mr-2 lg:col-span-5 lg:mr-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                {[0, 1].map((idx) => (
                  <div key={idx} className="relative">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 border border-foreground/15"
                    />
                    <div
                      className={cn(
                        'relative overflow-hidden rounded-none border border-foreground/15 bg-muted',
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
                  </div>
                ))}
              </div>
              <div className="space-y-4 pt-10">
                {[2, 3].map((idx) => (
                  <div key={idx} className="relative">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 border border-foreground/15"
                    />
                    <div
                      className={cn(
                        'relative overflow-hidden rounded-none border border-foreground/15 bg-muted',
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
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-6 left-2 z-10 border border-foreground bg-background px-5 py-3 shadow-[6px_6px_0_0] shadow-foreground/15">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {featuredProductSubtitle} · {featuredProductName}
              </p>
              <p className="mt-1 text-4xl font-extrabold leading-none tracking-tighter text-foreground tabular-nums sm:text-5xl">
                {featuredProductPrice}
              </p>
            </div>

            <div className="absolute -right-2 -top-4 z-10 flex items-center gap-2.5 border border-foreground bg-background px-3.5 py-2 shadow-[4px_4px_0_0] shadow-primary/30 sm:-right-3">
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-none bg-primary/10 text-primary"
              >
                <Check className="size-4" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-xs font-semibold tracking-tight text-foreground">
                  {heroBadgeTitle}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {heroBadgeSubtitle}
                </span>
              </span>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
