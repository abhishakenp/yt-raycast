import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * BeautyStoreHero — split editorial hero for a beauty / skincare / cosmetics
 * e-commerce storefront. A soft token-gradient background with a two-column
 * layout: left side carries an eyebrow, a large serif headline with one phrase
 * in the primary accent color, a supporting paragraph, dual rounded CTAs (filled
 * primary + outlined secondary), and a social-proof strip (overlapping customer
 * avatar stack + star rating + rating count); right side shows a tall 4:5 product
 * image with a floating cruelty-free badge. CTAs route through useNavigate.
 * Use as the opening hero for beauty stores, skincare shops, cosmetics brands,
 * clean beauty retailers, or premium personal-care DTC storefronts.
 */
export const BeautyStoreHero = defineCapsule({
  name: 'BeautyStoreHero',
  description:
    'Split editorial hero for a beauty / skincare / cosmetics e-commerce storefront: a soft token-gradient background with a two-column layout. Left side has an eyebrow badge, large serif headline with one phrase in the primary accent, supporting paragraph, dual rounded CTAs (filled primary + outlined secondary), and a social-proof strip with overlapping customer avatars, star rating and rating count. Right side has a tall 4:5 product image with a floating cruelty-free badge. CTAs route through useNavigate. Use as the opening hero for beauty stores, skincare shops, cosmetics brands, or premium personal-care DTC storefronts.',
  lakebed: commerceCartLakebed,
  props: z.object({
    /** Eyebrow / collection label above the headline. */
    eyebrow: z.string().optional(),
    /** First heading line (rendered before the highlighted line). */
    headingTop: z.string().optional(),
    /** Phrase rendered in the primary accent color on its own line. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Rating summary text (e.g. '12,000+ Happy Customers'). */
    ratingCount: z.string().optional(),
    /** Rating value text (e.g. '4.9/5'). */
    ratingValue: z.string().optional(),
    /** Alt text driving the hero product image. */
    imageAlt: z.string().optional(),
    /** Floating badge title. */
    badgeTitle: z.string().optional(),
    /** Floating badge subtitle. */
    badgeSubtitle: z.string().optional(),
    /** Shoppable hero product or bundle name. */
    heroProductName: z.string().optional(),
    /** Shoppable hero product or bundle price. */
    heroProductPrice: z.string().optional(),
    /** Alt texts for the small overlapping customer avatars. */
    customerAlts: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'New Collection'
    const headingTop = props.headingTop ?? 'Radiant Beauty,'
    const highlight = props.highlight ?? 'Naturally Yours'
    const subheading =
      props.subheading ??
      'Discover our curated collection of clean, cruelty-free beauty products. From skincare essentials to makeup must-haves, embrace your natural glow with formulas that care for your skin and the planet.'
    const primaryCta = props.primaryCta ?? 'Shop Bestsellers'
    const secondaryCta = props.secondaryCta ?? 'Explore New Arrivals'
    const ratingCount = props.ratingCount ?? '12,000+ Happy Customers'
    const ratingValue = props.ratingValue ?? '4.9/5'
    const imageAlt =
      props.imageAlt ??
      'arrangement of luxury skincare products including serums creams and face oils on marble surface'
    const badgeTitle = props.badgeTitle ?? '100% Cruelty-Free'
    const badgeSubtitle = props.badgeSubtitle ?? 'Certified Clean Beauty'
    const heroProductName = props.heroProductName ?? 'Clean Beauty Glow Set'
    const heroProductPrice = props.heroProductPrice ?? '$58.00'
    const customerAlts = props.customerAlts?.length
      ? props.customerAlts
      : [
          'happy customer with clear glowing skin',
          'young woman with natural makeup smiling',
          'woman with radiant healthy skin portrait',
          'beautiful woman with dewy makeup look',
        ]
    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt,
        label: heroProductName,
        price: heroProductPrice,
        subtitle: badgeSubtitle,
      }),
    ])

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    )

    return (
      <HeroSection
        className={cn(
          'relative bg-gradient-to-br from-primary/10 via-background to-muted/40',
          props.className,
        )}
      >
        <Container size="xl" className="py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">
                {eyebrow}
              </span>
              <HeroHeading className="font-serif font-semibold">
                {headingTop}
                <br />
                <HeroHighlight>{highlight}</HeroHighlight>
              </HeroHeading>
              <HeroSubheading className="mt-0 max-w-lg">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-wrap gap-4">
                <HeroCta
                  asChild
                  className="rounded-full bg-foreground px-8 py-4 font-medium text-background hover:bg-foreground/90"
                >
                  <button type="button" onClick={() => go(primaryCta)}>
                    {primaryCta}
                  </button>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-full px-8 py-4 font-medium hover:border-foreground"
                >
                  <button type="button" onClick={() => go(secondaryCta)}>
                    {secondaryCta}
                  </button>
                </HeroCta>
              </HeroActions>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {customerAlts.map((alt) => (
                    <Image
                      key={alt}
                      alt={alt}
                      w={100}
                      h={100}
                      className="size-10 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{ratingCount}</p>
                  <div className="flex items-center gap-1 text-primary">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="size-4" />
                    ))}
                    <span className="ml-1 text-muted-foreground">
                      {ratingValue}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={1000}
                rounded="xl"
                className="aspect-[4/5] shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg
                      className="size-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {badgeTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {badgeSubtitle}
                    </p>
                    <CommerceAddItemButton
                      lakebed={lakebed}
                      item={{
                        label: heroProductName,
                        price: heroProductPrice,
                      }}
                      aria-label={`Add ${heroProductName} to cart`}
                      pendingChildren={<CommerceMutationSpinner />}
                      className="mt-3 inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-card-foreground transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-70"
                    >
                      Add set · {heroProductPrice}
                    </CommerceAddItemButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
