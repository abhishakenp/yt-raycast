import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useCommerceFilteredProducts,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import {
  PricingGrid,
  PricingTier,
  PricingTierBadge,
  PricingTierHeader,
  PricingTierName,
  PricingTierTagline,
  PricingTierPrice,
  PricingTierPeriod,
  PricingTierFeatures,
  PricingTierFeature,
} from '#/section-kit/PricingGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * SubscriptionBoxPricing — playful-commerce box-tier band for a subscription-box
 * brand backed by shared Lakebed commerce state. An asymmetric header (heading
 * with a tilted primary marker on the key word, mono cadence meta right) sits
 * over a staggered 3-tier grid of chunky box-motif plan cards (Mini, Classic —
 * highlighted, Deluxe): each is a sharp-cornered token-bordered box with a hard
 * offset token shadow, a mono plan index, a giant tabular-nums price, a
 * hairline-divided feature checklist, and a full-width squared add-plan CTA with
 * press feedback; alternating tiers translate down and the featured tier inverts
 * to bg-foreground/text-background with a rotated "Popular" sticker. Tiers seed
 * command search and write to the shared cart used by the subscription navbar.
 * Use to present box plans on any curated-box or membership page.
 */
export const SubscriptionBoxPricing = defineCapsule({
  name: 'SubscriptionBoxPricing',
  description:
    'Playful-commerce box-tier pricing band for a subscription-box brand backed by shared Lakebed commerce state: an asymmetric marker-highlighted header over a staggered 3-tier grid of chunky box-motif plan cards (Mini, Classic highlighted, Deluxe) with mono plan indexes, giant tabular-nums prices, hairline feature checklists, and squared hard-shadow add-plan CTAs with press feedback; the featured tier inverts to a dark surface with a rotated Popular sticker. Tiers seed command search and write to the shared cart used by the subscription navbar. Use to present box plans on any curated-box or membership page.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.string().optional(),
          ctaTarget: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    /** Label shown while a plan is being added. */
    addingLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Pick your box'
    const subheading =
      props.subheading ??
      'One simple monthly price. Free shipping, skip or cancel anytime.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Mini',
            price: '$19',
            period: '/mo',
            features: [
              '3–4 curated items',
              'Monthly delivery',
              'Free shipping',
              'Skip anytime',
            ],
            cta: 'Start Mini',
            ctaTarget: 'Pricing',
          },
          {
            name: 'Classic',
            price: '$39',
            period: '/mo',
            features: [
              '6–8 curated items',
              'Personalized to your taste',
              'Free shipping',
              'Skip or cancel anytime',
              'Member-only extras',
            ],
            cta: 'Start Classic',
            ctaTarget: 'Pricing',
            highlighted: true,
          },
          {
            name: 'Deluxe',
            price: '$69',
            period: '/mo',
            features: [
              '10+ premium items',
              'Full personalization',
              'Free priority shipping',
              'Early access drops',
              'Surprise bonus gifts',
            ],
            cta: 'Start Deluxe',
            ctaTarget: 'Pricing',
          },
        ]
    useSyncCommerceCatalog(
      lakebed,
      tiers.map((tier) =>
        commerceProduct({
          imageAlt: `${tier.name} subscription box plan`,
          label: `${tier.name} box`,
          price: `${tier.price}${tier.period ?? ''}`,
          subtitle: 'Subscription plan',
        }),
      ),
    )
    const visibleTiers = useCommerceFilteredProducts(lakebed, tiers, (tier) => [
      tier.name,
      `${tier.name} box`,
      tier.price,
      tier.period,
      ...(tier.features ?? []),
    ])

    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Container className="relative">
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="size-1.5 shrink-0 bg-primary"
                  aria-hidden="true"
                />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Plans
                </span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingLead ? `${headingLead} ` : ''}
                <span className="relative inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute -inset-x-2 inset-y-1 -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ monthly ] cancel anytime
            </p>
          </div>

          <PricingGrid className="items-start gap-6 md:grid-cols-3 xl:grid-cols-3">
            {visibleTiers.map((tier, index) => {
              const t = tier as {
                name: string
                price: string
                features?: string[]
                cta?: string
                ctaTarget?: string
                tagline?: string
                blurb?: string
                description?: string
                audience?: string
                period?: string
                unit?: string
                cadence?: string
                suffix?: string
                highlighted?: boolean
                featured?: boolean
                popular?: boolean
                badge?: string
                popularLabel?: string
                excluded?: string[]
                annual?: string
                priceSuffix?: string
                note?: string
              }
              const isFeatured = Boolean(
                t.highlighted || t.featured || t.popular,
              )
              const blurb = t.tagline || t.blurb || t.description || t.audience
              const unit = t.period || t.unit || t.cadence || t.suffix
              return (
                <PricingTier
                  key={t.name}
                  className={cn(
                    'gap-5 rounded-none border-2 border-foreground p-6 shadow-[8px_8px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[10px_10px_0_0] motion-reduce:transform-none sm:p-7',
                    isFeatured ? 'bg-foreground text-background' : 'bg-card',
                    !isFeatured && 'md:translate-y-8',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="absolute -top-4 right-6 rotate-3 rounded-full border-2 border-foreground bg-background px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground shadow-[3px_3px_0_0] shadow-foreground">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-0">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums',
                        isFeatured
                          ? 'text-background/60'
                          : 'text-muted-foreground',
                      )}
                    >
                      {String(index + 1).padStart(2, '0')} / box
                    </span>
                    <PricingTierName
                      className={cn(
                        'mt-3 text-xl font-bold tracking-tight',
                        isFeatured ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {blurb ? (
                      <PricingTierTagline
                        className={cn(
                          'mt-2',
                          isFeatured ? 'text-background/70' : undefined,
                        )}
                      >
                        {blurb}
                      </PricingTierTagline>
                    ) : null}
                    <span className="mt-6 flex items-baseline gap-1.5">
                      <PricingTierPrice
                        className={cn(
                          'text-5xl font-extrabold leading-none tracking-tight tabular-nums sm:text-5xl',
                          isFeatured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {unit ? (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.12em]',
                            isFeatured ? 'text-background/60' : undefined,
                          )}
                        >
                          {unit}
                        </PricingTierPeriod>
                      ) : null}
                    </span>
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures
                      className={cn(
                        'mt-6 gap-0 divide-y border-t',
                        isFeatured
                          ? 'divide-background/15 border-background/15'
                          : 'divide-border border-border',
                      )}
                    >
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                          className={cn(
                            'gap-3 py-2.5',
                            isFeatured
                              ? 'text-background/85 [&>svg]:text-background'
                              : 'text-foreground/85',
                          )}
                        >
                          {typeof feature === 'string'
                            ? feature
                            : (feature as { label: string }).label}
                        </PricingTierFeature>
                      ))}
                    </PricingTierFeatures>
                  )}
                  <CommerceAddItemButton
                    lakebed={lakebed}
                    item={{
                      label: `${t.name} box`,
                      price: `${t.price}${t.period ?? ''}`,
                    }}
                    aria-label={`Add ${t.name} box to cart`}
                    pendingChildren={
                      <>
                        <CommerceMutationSpinner className="size-4" />
                        {props.addingLabel ?? 'Adding'}
                      </>
                    }
                    className={cn(
                      'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none border-2 px-5 py-2.5 text-sm font-bold transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70',
                      isFeatured
                        ? 'border-background bg-background text-foreground shadow-[4px_4px_0_0] shadow-background/40 hover:bg-background/90'
                        : 'border-foreground bg-foreground text-background shadow-[4px_4px_0_0] shadow-foreground/25 hover:bg-foreground/90',
                    )}
                  >
                    {t.cta ?? 'Get started'}
                  </CommerceAddItemButton>
                </PricingTier>
              )
            })}
          </PricingGrid>
        </Container>
      </section>
    )
  },
})
