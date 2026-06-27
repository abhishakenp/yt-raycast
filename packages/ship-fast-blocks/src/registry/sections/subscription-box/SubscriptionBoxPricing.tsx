import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useCommerceFilteredProducts,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {visibleTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    'relative flex flex-col gap-6 rounded-xl border bg-card p-8',
                    tier.highlighted
                      ? 'border-2 border-primary shadow-lg'
                      : 'border-border',
                  )}
                >
                  {tier.highlighted ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most popular
                    </span>
                  ) : null}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {tier.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        {tier.price}
                      </span>
                      {tier.period ? (
                        <span className="text-sm text-muted-foreground">
                          {tier.period}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {tier.features?.length ? (
                    <ul className="flex flex-col gap-3">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <svg
                            className="mt-0.5 size-4 shrink-0 text-primary"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m5 13 4 4L19 7"
                            />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <CommerceAddItemButton
                    lakebed={lakebed}
                    item={{
                      label: `${tier.name} box`,
                      price: `${tier.price}${tier.period ?? ''}`,
                    }}
                    aria-label={`Add ${tier.name} box to cart`}
                    pendingChildren={
                      <>
                        <CommerceMutationSpinner className="size-4" />
                        {addingLabel}
                      </>
                    }
                    className={cn(
                      'mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-70',
                      tier.highlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-border bg-background text-foreground hover:bg-muted',
                    )}
                  >
                    {tier.cta ?? 'Get started'}
                  </CommerceAddItemButton>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    )
  },
})
