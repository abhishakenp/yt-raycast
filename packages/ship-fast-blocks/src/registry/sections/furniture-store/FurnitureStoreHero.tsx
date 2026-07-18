import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroMediaPanel,
  HeroStats,
  HeroStat,
  HeroStatValue,
  HeroStatLabel,
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
 * FurnitureStoreHero — split, two-column hero for a warm minimal furniture /
 * home-decor store. A soft muted band with a tall left column (uppercase
 * collection eyebrow, large serif-style headline, supporting paragraph, primary +
 * secondary CTA buttons, and a bordered KPI strip) beside a full-bleed lifestyle
 * room photo with a floating featured-product price card pinned to its corner.
 * Stacks the photo above the copy on mobile. CTAs route through useNavigate. Use
 * as the top hero for furniture stores, home-decor or interiors brands, or any
 * warm boutique-retail landing page needing a product-forward lifestyle shot.
 * Renders fully with no props via baked-in "Haven & Home" defaults.
 */
export const FurnitureStoreHero = defineCapsule({
  name: 'FurnitureStoreHero',
  description:
    'Split two-column hero for a warm minimal furniture / home-decor store: a soft muted band with a tall left column (uppercase collection eyebrow, large headline, supporting paragraph, primary + secondary CTA buttons, bordered KPI strip) beside a full-bleed lifestyle room photo with a floating featured-product price card pinned to its corner; photo stacks above copy on mobile. CTAs route through useNavigate. Use as the top hero for furniture stores, home-decor or interiors brands, or any warm boutique-retail landing page needing a product-forward lifestyle shot.',
  lakebed: commerceCartLakebed,
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    /** Floating featured-product callout over the hero image. */
    featuredLabel: z.string().optional(),
    featuredName: z.string().optional(),
    featuredPrice: z.string().optional(),
    /** Inline KPI strip beneath the hero copy. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Spring Collection 2026'
    const heading = props.heading ?? 'Create a home that feels like you'
    const subheading =
      props.subheading ??
      'Thoughtfully designed furniture and decor for modern living. Minimal, warm, and made to last for generations.'
    const primaryCta = props.primaryCta ?? 'Explore Rooms'
    const secondaryCta = props.secondaryCta ?? 'New Arrivals'
    const imageAlt =
      props.imageAlt ??
      'Bright modern living room with cream linen sofa, warm wood coffee table, and potted plants in natural light'
    const featuredLabel = props.featuredLabel ?? 'Featured: The Cloud Sofa'
    const featuredName = props.featuredName ?? 'The Cloud Sofa'
    const featuredPrice = props.featuredPrice ?? 'Starting at $2,849'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '15K+', label: 'Happy Homes' },
          { value: '4.9', label: 'Average Rating' },
          { value: '48h', label: 'Delivery to Metro' },
        ]
    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt,
        label: featuredName,
        price: featuredPrice,
        subtitle: featuredLabel,
      }),
    ])

    const ArrowLong = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <HeroSection
        className={cn('relative bg-muted', props.className)}
        aria-labelledby="furniture-hero-heading"
      >
        <Container size="xl">
          <div className="grid min-h-[70vh] lg:min-h-[80vh] lg:grid-cols-2">
            <div className="order-2 flex flex-col justify-center px-4 py-12 sm:px-6 lg:order-1 lg:px-12 lg:py-0">
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <HeroHeading
                id="furniture-hero-heading"
                className="mb-6 font-medium"
              >
                {heading}
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 max-w-md">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                  <ArrowLong className="ml-2 size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {secondaryCta}
                </button>
              </HeroActions>
              <HeroStats className="mt-12 flex gap-8 pt-8">
                {stats.map((s: { value: string; label: string }) => (
                  <HeroStat key={s.label}>
                    <HeroStatValue className="text-2xl font-semibold">
                      {s.value}
                    </HeroStatValue>
                    <HeroStatLabel className="mt-0">{s.label}</HeroStatLabel>
                  </HeroStat>
                ))}
              </HeroStats>
            </div>
            <div className="relative order-1 h-[50vh] lg:order-2 lg:h-auto">
              <HeroMediaPanel
                alt={imageAlt}
                w={1200}
                h={800}
                rounded="2xl"
                className="absolute inset-0 size-full rounded-none"
              />
              <div className="absolute bottom-6 right-6 hidden rounded-lg bg-card/95 p-4 shadow-lg backdrop-blur-sm sm:block">
                <p className="text-sm font-medium text-card-foreground">
                  {featuredLabel}
                </p>
                <p className="text-sm text-muted-foreground">{featuredPrice}</p>
                <CommerceAddItemButton
                  lakebed={lakebed}
                  item={{ label: featuredName, price: featuredPrice }}
                  aria-label={`Add ${featuredName} to cart`}
                  pendingChildren={<CommerceMutationSpinner />}
                  className="mt-3 inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  Add featured
                </CommerceAddItemButton>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
