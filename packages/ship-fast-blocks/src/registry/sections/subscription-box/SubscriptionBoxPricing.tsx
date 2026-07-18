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
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

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
        <div className="mx-auto max-w-7xl px-6">
          <section className="flex flex-col gap-10">
            <SectionHeading title={heading} subtitle={subheading} />
            <PricingGrid
              tiers={visibleTiers}
              heading="Pick your box"
              subheading="One simple monthly price. Free shipping, skip or cancel anytime."
              className={props.className}
            />
          </section>
        </div>
      </section>
    )
  },
})
