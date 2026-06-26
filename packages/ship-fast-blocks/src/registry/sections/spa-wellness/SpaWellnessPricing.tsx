import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * SpaWellnessPricing — membership & package tiers for a day-spa / wellness page.
 * Thin configuration over the shared `PricingGrid` composite: a centered heading
 * + intro above a responsive 3-column grid of membership cards (name, price +
 * billing period, checkmark perk bullets, and a CTA). The highlighted tier gets
 * a primary border, shadow, and a floating "Most popular" pill, and every CTA
 * routes through useNavigate. Use to present spa memberships, treatment
 * packages, or wellness bundles. Renders fully with no props via baked-in
 * defaults.
 */
export const SpaWellnessPricing = defineComponent({
  name: 'SpaWellnessPricing',
  description:
    'Membership & package tiers for a day-spa / wellness page built on the shared PricingGrid composite: a centered heading + intro above a responsive 3-column grid of membership cards (name, price + billing period, checkmark perk bullets, and a CTA). The highlighted tier gets a primary border, shadow, and a floating pill, and every CTA routes through useNavigate. Use to present spa memberships, treatment packages, or wellness bundles.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Membership / package tiers; mark one with highlighted to feature it. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Memberships & packages'
    const subheading =
      props.subheading ??
      'Make rest a ritual. Choose a plan that keeps you coming back to calm all year long.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Day Pass',
            price: '$45',
            period: '/visit',
            features: [
              'Full facility access',
              'Sauna & steam room',
              'Relaxation lounge',
              'Herbal tea bar',
            ],
            cta: 'Book a Pass',
            highlighted: false,
          },
          {
            name: 'Monthly Renew',
            price: '$129',
            period: '/mo',
            features: [
              'One signature treatment monthly',
              'Unlimited facility access',
              '15% off additional services',
              'Priority booking',
              'Complimentary guest pass',
            ],
            cta: 'Join Now',
            highlighted: true,
          },
          {
            name: 'Annual Sanctuary',
            price: '$1,290',
            period: '/yr',
            features: [
              'Two treatments every month',
              'Unlimited facility access',
              '20% off all services & products',
              'Dedicated wellness concierge',
              'Seasonal members-only events',
            ],
            cta: 'Become a Member',
            highlighted: false,
          },
        ]

    return (
      <PricingGrid
        heading={heading}
        subheading={subheading}
        tiers={tiers.map((t) => ({
          name: t.name,
          price: t.price,
          period: t.period,
          features: t.features,
          cta: t.cta,
          ctaTarget: t.cta,
          highlighted: t.highlighted,
        }))}
        className={props.className}
      />
    )
  },
})
