import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
  HeroStats,
  HeroStat,
  HeroStatValue,
  HeroStatLabel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * FurnitureStoreHero — editorial-catalog asymmetric hero for a warm minimal
 * furniture / home-decor store. On the adaptive background, an asymmetric 5:7
 * split over a giant faint ghost "01" watermark: a narrower left copy column
 * (mono index-numbered collection micro-label rail with a hairline rule, large
 * tight-tracked headline, supporting paragraph, square primary + hairline
 * secondary CTA buttons with press feedback, and a collapsed hairline KPI
 * ledger of tabular-num stats) beside a larger full-bleed lifestyle room plate
 * with an offset hairline frame and a floating museum-label placard (mono
 * caption + tabular-num price + add-to-cart) pinned to its corner. Stacks the
 * plate above the copy on mobile. CTAs route through section-kit route links.
 * Use as the top hero for furniture stores, home-decor or interiors brands, or
 * any warm boutique-retail landing page needing a product-forward lifestyle
 * shot. Renders fully with no props via baked-in "Haven & Home" defaults.
 */
export const FurnitureStoreHero = defineCapsule({
  name: 'FurnitureStoreHero',
  description:
    'Editorial-catalog asymmetric hero for a warm minimal furniture / home-decor store: on the adaptive background an asymmetric 5:7 split over a giant faint ghost "01" watermark, a narrower left copy column (mono index-numbered collection micro-label rail with a hairline rule, large tight-tracked headline, supporting paragraph, square primary + hairline secondary CTA buttons with press feedback, and a collapsed hairline KPI ledger of tabular-num stats) beside a larger full-bleed lifestyle room plate with an offset hairline frame and a floating museum-label placard (mono caption + tabular-num price + add-to-cart) pinned to its corner; the plate stacks above the copy on mobile. CTAs route through section-kit route links. Use as the top hero for furniture stores, home-decor or interiors brands, or any warm boutique-retail landing page needing a product-forward lifestyle shot.',
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
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
        aria-labelledby="furniture-hero-heading"
      >
        {/* Giant faint ghost catalog numeral behind the copy column. */}
        <Watermark className="-left-4 bottom-0 text-[12rem] leading-none sm:text-[16rem] lg:text-[22rem]">
          01
        </Watermark>
        <Container size="xl" className="relative">
          <div className="grid items-center gap-10 py-12 sm:py-16 lg:min-h-[40rem] lg:grid-cols-12 lg:gap-12 lg:py-16">
            <div className="order-2 flex flex-col justify-center lg:order-1 lg:col-span-5">
              {/* Mono index micro-label rail with hairline rule. */}
              <div className="mb-6 flex items-center gap-4">
                <MonoTag className="tracking-[0.2em]">
                  <span aria-hidden="true" className="text-primary">
                    01&nbsp;/&nbsp;
                  </span>
                  {eyebrow}
                </MonoTag>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <HeroHeading
                id="furniture-hero-heading"
                className="mb-6 text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              >
                {heading}
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 max-w-md leading-relaxed">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-wrap gap-3">
                <HeroCta
                  asChild
                  variant="primary"
                  className="rounded-none px-6 py-3.5 text-sm transition-[background-color,transform] duration-150 active:translate-y-px motion-reduce:active:translate-y-0"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                    <ArrowLong className="ml-2 size-4" />
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none border-foreground/20 px-6 py-3.5 text-sm transition-[background-color,transform] duration-150 hover:bg-muted active:translate-y-px motion-reduce:active:translate-y-0"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <HeroStats className="mt-12 grid grid-cols-3 gap-0 border-l border-t border-border pt-0">
                {stats.map((s: { value: string; label: string }) => (
                  <HeroStat
                    key={s.label}
                    className="border-b border-r border-border p-4"
                  >
                    <HeroStatValue className="text-2xl font-semibold tabular-nums tracking-tight">
                      {s.value}
                    </HeroStatValue>
                    <HeroStatLabel className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em]">
                      {s.label}
                    </HeroStatLabel>
                  </HeroStat>
                ))}
              </HeroStats>
            </div>
            <div className="relative order-1 lg:order-2 lg:col-span-7">
              {/* Offset hairline frame behind the plate. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-foreground/20 lg:translate-x-4 lg:translate-y-4"
              />
              <div className="relative aspect-[4/3] lg:aspect-[7/6]">
                <HeroMediaPanel
                  alt={imageAlt}
                  w={1200}
                  h={800}
                  className="absolute inset-0 size-full rounded-none"
                />
                <div className="absolute -bottom-5 right-4 hidden max-w-[15rem] rounded-none border border-border bg-card p-4 text-card-foreground shadow-[6px_6px_0_0] shadow-foreground/10 sm:block">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span aria-hidden="true" className="text-primary">
                      01&nbsp;/&nbsp;
                    </span>
                    {featuredLabel}
                  </p>
                  <p className="mt-1 text-sm font-medium tabular-nums text-card-foreground">
                    {featuredPrice}
                  </p>
                  <CommerceAddItemButton
                    lakebed={lakebed}
                    item={{ label: featuredName, price: featuredPrice }}
                    aria-label={`Add ${featuredName} to cart`}
                    pendingChildren={<CommerceMutationSpinner />}
                    className="mt-3 inline-flex items-center rounded-none bg-foreground px-3 py-2 text-xs font-medium text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70 motion-reduce:active:translate-y-0"
                  >
                    Add featured
                  </CommerceAddItemButton>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
