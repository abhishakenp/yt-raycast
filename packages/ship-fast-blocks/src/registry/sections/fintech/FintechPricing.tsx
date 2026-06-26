import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * FintechPricing — three-tier pricing section for a fintech / neobank landing
 * page. A padded section wrapping the shared PricingGrid composite with a
 * heading and three plans: a free Personal tier, a highlighted Plus tier, and a
 * Business tier, each with a feature list and a routable CTA. The grid is
 * layout-only, so this capsule supplies the section wrapper and container
 * padding. Renders fully with no props via baked-in "Vault" defaults.
 */
export const FintechPricing = defineComponent({
  name: 'FintechPricing',
  description:
    'Three-tier pricing section for a fintech / neobank landing page: a padded section wrapping the shared PricingGrid composite with a heading and three plans (free Personal, highlighted Plus, and Business), each with a feature list and a routable CTA. The capsule supplies the section wrapper and container padding around the layout-only grid.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Pricing tiers: name, price, period, features, cta, highlighted. */
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
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Simple, transparent pricing'
    const subheading =
      props.subheading ??
      "No hidden fees, no surprises. Start free and upgrade whenever you're ready."
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Personal',
            price: '$0',
            period: '/mo',
            features: [
              'Free checking & savings',
              'Instant peer-to-peer transfers',
              'Virtual debit card',
              '3.5% APY on savings',
            ],
            cta: 'Open free account',
            ctaTarget: 'Open an Account',
          },
          {
            name: 'Plus',
            price: '$9',
            period: '/mo',
            features: [
              'Everything in Personal',
              'Premium metal card',
              'Spending insights & budgets',
              'Fee-free global ATM withdrawals',
              'Priority support',
            ],
            cta: 'Get Plus',
            ctaTarget: 'Open an Account',
            highlighted: true,
          },
          {
            name: 'Business',
            price: '$29',
            period: '/mo',
            features: [
              'Everything in Plus',
              'Multi-user team access',
              'Invoicing & expense tracking',
              'Accounting integrations',
              'Dedicated account manager',
            ],
            cta: 'Start Business',
            ctaTarget: 'Open an Account',
          },
        ]

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PricingGrid
            heading={heading}
            subheading={subheading}
            tiers={tiers}
          />
        </div>
      </section>
    )
  },
})
