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
import { Container } from '#/section-kit/Container.tsx'

/**
 * CafeHero — split-layout hero section for a cozy neighborhood cafe / coffee
 * shop landing page. Left side: an open-now availability pill with a pulsing
 * dot, a serif headline with an italic amber highlight phrase, a supporting
 * paragraph, dual rounded CTAs (filled primary + outlined secondary), and an
 * inline KPI strip beneath. Right side: a tall interior photo with a floating
 * customer-review card anchored to the bottom-left corner. Every CTA routes
 * through useNavigate. Use as the opening hero for cafes, bakeries, tea
 * houses, brunch spots, or any warm food-and-drink small business. Renders
 * fully with no props via baked-in "Little Owl Coffee" defaults.
 */
export const CafeHero = defineCapsule({
  name: 'CafeHero',
  description:
    'Split-layout hero section for a cozy cafe / coffee shop landing page: left side with an open-now availability pill (pulsing dot), serif headline with an italic amber highlight phrase, supporting paragraph, dual rounded CTAs (filled primary + outlined secondary), and an inline KPI strip; right side has a tall interior photo with a floating customer-review card anchored bottom-left. CTAs route through useNavigate. Use as the opening hero for cafes, bakeries, tea houses, brunch spots, or warm food-and-drink businesses.',
  lakebed: commerceCartLakebed,
  props: z.object({
    /** Availability / status pill text. */
    badge: z.string().optional(),
    /** First heading line (before the highlight). */
    headingTop: z.string().optional(),
    /** Phrase rendered with the amber italic highlight. */
    highlight: z.string().optional(),
    /** Trailing heading text after the highlight. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Featured shoppable cafe item name. */
    featuredItemName: z.string().optional(),
    /** Featured shoppable cafe item price. */
    featuredItemPrice: z.string().optional(),
    /** Alt text driving the tall hero interior photo. */
    imageAlt: z.string().optional(),
    /** Floating customer-review card over the hero photo — quote text. */
    quote: z.string().optional(),
    /** Quote attribution name. */
    quoteName: z.string().optional(),
    /** Quote attribution role. */
    quoteRole: z.string().optional(),
    /** Alt text driving the quote avatar image. */
    quoteAvatarAlt: z.string().optional(),
    /** Inline KPI strip beneath the hero copy. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const badge = props.badge ?? 'Now Open — 7am to 7pm Daily'
    const headingTop = props.headingTop ?? 'Coffee that feels like'
    const highlight = props.highlight ?? 'home'
    const headingBottom = props.headingBottom ?? ''
    const subheading =
      props.subheading ??
      "Specialty coffee, house-made pastries, and a cozy corner for your morning ritual. Located in the heart of Portland's Pearl District since 2018."
    const primaryCta = props.primaryCta ?? 'View Menu'
    const secondaryCta = props.secondaryCta ?? 'Find Us'
    const featuredItemName = props.featuredItemName ?? 'Oat Flat White'
    const featuredItemPrice = props.featuredItemPrice ?? '$5.50'
    const imageAlt =
      props.imageAlt ??
      'Cozy coffee shop interior with warm wood tables, exposed brick walls, and soft morning light streaming through large windows'
    const quote = props.quote ?? 'Best latte in Portland, hands down.'
    const quoteName = props.quoteName ?? 'Sarah Chen'
    const quoteRole = props.quoteRole ?? 'Verified Google Review'
    const quoteAvatarAlt =
      props.quoteAvatarAlt ??
      'Professional headshot of Sarah Chen, a smiling customer with short dark hair'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '4.9', label: 'Google Rating' },
          { value: '6', label: 'Years Serving' },
          { value: '12', label: 'Coffee Origins' },
        ]
    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt,
        label: featuredItemName,
        price: featuredItemPrice,
        subtitle: badge,
      }),
    ])

    return (
      <HeroSection
        variant="split"
        className={cn(
          'px-6 pt-20 pb-20 lg:px-8 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                {badge}
              </div>
              <h1 className="font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl lg:text-6xl">
                {headingTop}{' '}
                <span className="italic text-primary">{highlight}</span>
                {headingBottom ? ` ${headingBottom}` : null}
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {secondaryCta}
                </button>
              </div>
              <CommerceAddItemButton
                lakebed={lakebed}
                item={{ label: featuredItemName, price: featuredItemPrice }}
                aria-label={`Add ${featuredItemName} to cart`}
                pendingChildren={
                  <>
                    <CommerceMutationSpinner />
                    Adding
                  </>
                }
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-70"
              >
                Add today&apos;s pick · {featuredItemPrice}
              </CommerceAddItemButton>
              <div className="flex items-center gap-8 pt-4">
                {stats.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-8">
                    {i > 0 ? <div className="h-12 w-px bg-border" /> : null}
                    <div>
                      <p className="font-serif text-3xl font-medium text-foreground">
                        {s.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={1000}
                  className="size-full object-cover"
                />
              </div>
              <HeroStatBadge className="absolute -bottom-6 -left-6 max-w-xs shadow-lg">
                <HeroStatBadgeTitle asChild className="mb-2 font-serif text-lg">
                  <p>&ldquo;{quote}&rdquo;</p>
                </HeroStatBadgeTitle>
                <div className="flex items-center gap-3">
                  <HeroStatBadgeIcon className="size-10 rounded-full bg-transparent p-0">
                    <Image
                      alt={quoteAvatarAlt}
                      w={100}
                      h={100}
                      className="size-10 rounded-full object-cover"
                    />
                  </HeroStatBadgeIcon>
                  <HeroStatBadgeContent>
                    <HeroStatBadgeTitle className="text-sm font-medium">
                      {quoteName}
                    </HeroStatBadgeTitle>
                    <HeroStatBadgeSubtitle className="text-xs">
                      {quoteRole}
                    </HeroStatBadgeSubtitle>
                  </HeroStatBadgeContent>
                </div>
              </HeroStatBadge>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
