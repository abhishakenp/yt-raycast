import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
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
  PricingTierCta,
} from '#/section-kit/PricingGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * SubscriptionBoxPricing — pricing band for a subscription-box brand built on
 * shared Lakebed commerce state. A padded section wraps three monthly box tiers
 * (Mini, Classic — highlighted, Deluxe), each with a per-month price, feature
 * list, and a scoped add-plan CTA. Tiers seed command search and write to the
 * shared cart used by the subscription navbar. Use to present box plans on any
 * curated-box or membership page.
 */
export const SubscriptionBoxPricing = defineCapsule({
  name: 'SubscriptionBoxPricing',
  description:
    'Pricing band for a subscription-box brand backed by shared Lakebed commerce state: a padded section wrapping three monthly box tiers (Mini, Classic highlighted, Deluxe) with per-month prices, feature lists, and scoped add-plan CTAs. Tiers seed command search and write to the shared cart used by the subscription navbar. Use to present box plans on any curated-box or membership page.',
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
    const addingLabel = props.addingLabel ?? 'Adding'

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

    void addingLabel
    return (
      <section
        className={cn(
          'bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Container size="xl" className="px-6 lg:px-6">
          <section className="flex flex-col gap-10">
            <SectionHeading title={heading} subtitle={subheading} />
            <PricingGrid className={props.className}>
              <SectionHeading
                title={'Pick your box'}
                subtitle={
                  'One simple monthly price. Free shipping, skip or cancel anytime.'
                }
              />
              {visibleTiers.map((tier) => {
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
                return (
                  <PricingTier
                    key={t.name}
                    variant={
                      t.highlighted || t.featured || t.popular
                        ? 'highlighted'
                        : undefined
                    }
                  >
                    {t.highlighted || t.featured || t.popular ? (
                      <PricingTierBadge>
                        {t.badge ?? 'Popular'}
                      </PricingTierBadge>
                    ) : null}
                    <PricingTierHeader>
                      <PricingTierName>{t.name}</PricingTierName>
                      {t.tagline && (
                        <PricingTierTagline>{t.tagline}</PricingTierTagline>
                      )}
                      {t.blurb && (
                        <PricingTierTagline>{t.blurb}</PricingTierTagline>
                      )}
                      {t.description && (
                        <PricingTierTagline>{t.description}</PricingTierTagline>
                      )}
                      {t.audience && (
                        <PricingTierTagline>{t.audience}</PricingTierTagline>
                      )}
                      <PricingTierPrice>{t.price}</PricingTierPrice>
                      {t.period && (
                        <PricingTierPeriod>{t.period}</PricingTierPeriod>
                      )}
                      {t.unit && (
                        <PricingTierPeriod>{t.unit}</PricingTierPeriod>
                      )}
                      {t.cadence && (
                        <PricingTierPeriod>{t.cadence}</PricingTierPeriod>
                      )}
                      {t.suffix && (
                        <PricingTierPeriod>{t.suffix}</PricingTierPeriod>
                      )}
                    </PricingTierHeader>
                    {t.features && (
                      <PricingTierFeatures>
                        {t.features.map((feature) => (
                          <PricingTierFeature
                            key={
                              typeof feature === 'string'
                                ? feature
                                : (feature as { label: string }).label
                            }
                          >
                            {typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label}
                          </PricingTierFeature>
                        ))}
                      </PricingTierFeatures>
                    )}
                    {t.cta && (
                      <PricingTierCta target={t.ctaTarget}>
                        {t.cta}
                      </PricingTierCta>
                    )}
                  </PricingTier>
                )
              })}
            </PricingGrid>
          </section>
        </Container>
      </section>
    )
  },
})
