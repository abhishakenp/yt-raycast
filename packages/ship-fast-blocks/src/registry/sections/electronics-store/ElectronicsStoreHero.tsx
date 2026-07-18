import { defineCapsule } from '#/capsules/openui.ts'
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

/**
 * ElectronicsStoreHero — split storefront hero for a premium electronics /
 * gadgets shop on a soft muted band. Two-column layout: left carries a pill
 * badge, a large headline, a supporting paragraph, dual CTAs (filled primary
 * Shop Now with arrow + outlined View Deals) and a bordered inline KPI strip
 * (Happy Customers / Free Shipping / Easy Returns); right shows a square product
 * image with a floating best-seller product card (star icon + title + rating
 * meta). CTAs route through useNavigate. Use as the opening hero for electronics
 * stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.
 */
export const ElectronicsStoreHero = defineCapsule({
  name: 'ElectronicsStoreHero',
  description:
    'Split storefront hero for a premium electronics / gadgets shop on a soft muted band: a two-column layout where the left carries a pill badge, large headline, supporting paragraph, dual CTAs (filled primary Shop Now with an arrow + outlined View Deals) and a bordered inline KPI strip (e.g. 50K+ Happy Customers / 2-Day Free Shipping / 30-Day Easy Returns); the right shows a square product image with a floating best-seller product card (star icon + product title + rating meta). CTAs route through useNavigate; imagery is alt-driven. Use as the opening hero for electronics stores, gadget shops, consumer-tech retailers, audio/headphone shops, or camera/drone storefronts.',
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
    const go = useNavigate()
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
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-xl">
              <span className="mb-6 inline-block rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                {badge}
              </span>
              <h1 className="mb-6 text-4xl font-semibold leading-tight text-foreground lg:text-5xl">
                {heading}
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-wrap gap-4">
                <CommerceAddItemButton
                  lakebed={lakebed}
                  item={{ label: floatTitle, price: floatPrice }}
                  pendingChildren={
                    <CommerceMutationSpinner className="text-primary-foreground" />
                  }
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                  <ArrowRight />
                </CommerceAddItemButton>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="mt-10 flex items-center gap-8 border-t border-border pt-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-semibold text-foreground">
                      {s.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={800}
                  className="size-full object-cover"
                />
              </div>
              <HeroStatBadge
                className="absolute -bottom-6 -left-6 flex max-w-xs items-center gap-3"
              >
                <HeroStatBadgeIcon className="size-12 text-muted-foreground">
                  <Star className="size-6" />
                </HeroStatBadgeIcon>
                <HeroStatBadgeContent>
                  <HeroStatBadgeTitle asChild className="text-sm font-medium">
                    <div>{floatTitle}</div>
                  </HeroStatBadgeTitle>
                  <HeroStatBadgeSubtitle asChild className="text-xs">
                    <div>{floatMeta}</div>
                  </HeroStatBadgeSubtitle>
                </HeroStatBadgeContent>
              </HeroStatBadge>
            </div>
          </div>
        </div>
      </HeroSection>
    )
  },
})
