import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * CoworkingPricing — three-tier membership pricing for a coworking or shared-
 * workspace page. Thin configuration over the shared `PricingGrid` composite: a
 * centered heading block above three tier cards — Hot Desk, Dedicated Desk
 * (highlighted as "Most popular"), and Private Office — each with a monthly
 * price, a benefit list, and a routable CTA. Use to convert prospective members
 * for coworking spaces, shared offices, or flex-office providers. Renders fully
 * with no props via month-to-month baked-in defaults.
 */
export const CoworkingPricing = defineCapsule({
  name: 'CoworkingPricing',
  description:
    "Three-tier membership pricing for a coworking or shared-workspace page built on the shared PricingGrid composite: a centered heading block above three tier cards (Hot Desk, Dedicated Desk highlighted as 'Most popular', and Private Office), each with a monthly price/period, a benefit list, and a routable CTA. The highlighted tier gets a primary border and pill. Use to convert prospective members for coworking spaces, shared offices, or flex-office providers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Membership tiers — name, price, period, features, cta, highlighted. */
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
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Hot Desk',
            price: '$199',
            period: '/mo',
            features: [
              'Any open desk, first come first served',
              'Business-hours access (8am–8pm)',
              'Unlimited WiFi & free coffee',
              '5 hours of meeting-room credits',
            ],
            cta: 'Start with Hot Desk',
            ctaTarget: 'Book a Tour',
          },
          {
            name: 'Dedicated Desk',
            price: '$349',
            period: '/mo',
            features: [
              'Your own desk, locked drawer & monitor arm',
              '24/7 keycard access',
              'Unlimited WiFi & free coffee',
              '15 hours of meeting-room credits',
              'Business address & mail handling',
            ],
            cta: 'Get a Dedicated Desk',
            ctaTarget: 'Book a Tour',
            highlighted: true,
          },
          {
            name: 'Private Office',
            price: '$1,200',
            period: '/mo',
            features: [
              'Lockable private suite for 2–6 people',
              '24/7 keycard access',
              'Unlimited WiFi & free coffee',
              'Unlimited meeting-room access',
              'Branded signage & dedicated phone line',
            ],
            cta: 'Tour an Office',
            ctaTarget: 'Book a Tour',
          },
        ]
    return (
      <PricingGrid
        heading={props.heading ?? 'Simple, month-to-month memberships'}
        subheading={
          props.subheading ??
          'No long-term contracts and no setup fees — pick the plan that fits how you work and upgrade anytime.'
        }
        tiers={tiers}
        className={props.className}
      />
    )
  },
})
