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
import {
  HeroStatBadge,
  HeroStatBadgeIcon,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ElectronicsStoreHero — tech-brutalist split storefront hero for a premium
 * electronics / gadgets shop on a muted band. Asymmetric 7/5 grid: the left
 * column stacks a mono index eyebrow rule, a squared bg-foreground badge chip, a
 * giant extrabold headline, a supporting paragraph, dual CTAs (filled primary
 * Shop Now with a hard offset shadow + press feedback and an outlined border-2
 * View Deals) and a collapsed-border spec ledger of KPIs (Happy Customers / Free
 * Shipping / Easy Returns) with mono labels and tabular values; the right column
 * frames a square product image in a border-2 hard-shadow plate behind a giant
 * ghost model numeral, with a floating squared spec card (best-seller title,
 * rating meta, oversized tabular price). CTAs route through section-kit route
 * links. Use as the opening hero for electronics stores, gadget shops,
 * consumer-tech retailers, or audio/camera storefronts.
 */
export const ElectronicsStoreHero = defineCapsule({
  name: 'ElectronicsStoreHero',
  description:
    'Tech-brutalist split storefront hero for a premium electronics / gadgets shop on a muted band: an asymmetric 7/5 grid where the left column stacks a mono index eyebrow rule, a squared bg-foreground badge chip, a giant extrabold headline, a supporting paragraph, dual CTAs (filled primary Shop Now with a hard offset shadow + press feedback and an outlined border-2 View Deals) and a collapsed-border spec ledger of KPIs (e.g. 50K+ Happy Customers / 2-Day Free Shipping / 30-Day Easy Returns) with mono labels and tabular values; the right column frames a square product image in a border-2 hard-shadow plate behind a giant ghost model numeral, with a floating squared spec card (best-seller title, rating meta, oversized tabular price). CTAs route through section-kit route links; imagery is alt-driven. Use as the opening hero for electronics stores, gadget shops, consumer-tech retailers, audio/headphone shops, or camera/drone storefronts.',
  props: z.object({
    /** Pill badge above the headline. */
    badge: z.string().optional(),
    /** Main heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the hero product image. */
    imageAlt: z.string().optional(),
    /** Floating product card title. */
    floatTitle: z.string().optional(),
    /** Floating product card meta line. */
    floatMeta: z.string().optional(),
    /** Inline KPI strip beneath the hero copy. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Optional price for the floating hero product. */
    floatPrice: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'New Collection 2025'
    const heading =
      props.heading ?? 'Premium Audio & Tech for the Modern Lifestyle'
    const subheading =
      props.subheading ??
      'Discover our curated selection of high-performance headphones, smartwatches, and cutting-edge gadgets designed to elevate your everyday experience.'
    const primaryCta = props.primaryCta ?? 'Shop Now'
    const secondaryCta = props.secondaryCta ?? 'View Deals'
    const imageAlt =
      props.imageAlt ??
      'Premium over-ear wireless headphones with sleek matte black finish on minimal background'
    const floatTitle = props.floatTitle ?? 'Sony WH-1000XM5'
    const floatMeta = props.floatMeta ?? 'Best Seller • 4.9 (2,847 reviews)'
    const floatPrice = props.floatPrice ?? '$399.99'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '50K+', label: 'Happy Customers' },
          { value: '2-Day', label: 'Free Shipping' },
          { value: '30-Day', label: 'Easy Returns' },
        ]
    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt,
        label: floatTitle,
        price: floatPrice,
        subtitle: floatMeta,
      }),
    ])

    const ArrowRight = () => (
      <svg
        className="ml-2 size-4"
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

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-4', className)}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <HeroSection
        variant="split"
        className={cn('relative overflow-hidden bg-muted/40', props.className)}
      >
        <DotGrid
          density="default"
          tone="border"
          fade="bottom"
          className="inset-x-0 top-0 h-64"
        />
        <Container size="xl" className="relative py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="max-w-xl lg:col-span-7">
              <div className="mb-6 flex items-center gap-3 border-b-2 border-foreground pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="tabular-nums text-foreground">[ 01 ]</span>
                <span>Storefront</span>
                <span
                  aria-hidden="true"
                  className="ml-auto hidden tabular-nums text-muted-foreground/70 sm:inline"
                >
                  IN STOCK
                </span>
              </div>
              <span className="mb-6 inline-block rounded-none bg-foreground px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-background">
                {badge}
              </span>
              <h1 className="mb-6 text-balance text-5xl font-extrabold leading-[0.95] tracking-tight text-foreground lg:text-7xl">
                {heading}
              </h1>
              <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <CommerceAddItemButton
                  lakebed={lakebed}
                  item={{ label: floatTitle, price: floatPrice }}
                  pendingChildren={
                    <CommerceMutationSpinner className="text-primary-foreground" />
                  }
                  className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-[6px_6px_0_0] shadow-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0] active:translate-y-0 active:shadow-[3px_3px_0_0] disabled:pointer-events-none disabled:opacity-70 motion-reduce:transform-none"
                >
                  {primaryCta}
                  <ArrowRight />
                </CommerceAddItemButton>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border-2 border-foreground px-6 py-3.5 font-semibold text-foreground transition-all duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <dl className="mt-10 grid grid-cols-3 border-2 border-foreground">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="border-r-2 border-foreground p-4 last:border-r-0"
                  >
                    <dt className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
                      {s.value}
                    </dt>
                    <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {s.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative lg:col-span-5">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 right-0 select-none font-mono text-[7rem] font-extrabold leading-none tracking-tighter text-foreground/[0.06] sm:text-[10rem] lg:-top-16"
              >
                01
              </span>
              <div className="relative aspect-square overflow-hidden rounded-none border-2 border-foreground bg-muted shadow-[10px_10px_0_0] shadow-foreground">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={800}
                  className="size-full object-cover"
                />
              </div>
              <HeroStatBadge className="absolute -bottom-6 -left-4 flex max-w-xs items-center gap-3 rounded-none border-2 border-foreground shadow-[6px_6px_0_0] shadow-foreground sm:-left-6">
                <HeroStatBadgeIcon className="size-12 rounded-none bg-foreground text-background">
                  <Star className="size-6" />
                </HeroStatBadgeIcon>
                <HeroStatBadgeContent>
                  <HeroStatBadgeTitle asChild className="text-sm font-semibold">
                    <div>{floatTitle}</div>
                  </HeroStatBadgeTitle>
                  <HeroStatBadgeSubtitle
                    asChild
                    className="font-mono text-[10px] uppercase tracking-[0.14em]"
                  >
                    <div>{floatMeta}</div>
                  </HeroStatBadgeSubtitle>
                  <div className="mt-1 text-lg font-extrabold tabular-nums tracking-tight text-foreground">
                    {floatPrice}
                  </div>
                </HeroStatBadgeContent>
              </HeroStatBadge>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
