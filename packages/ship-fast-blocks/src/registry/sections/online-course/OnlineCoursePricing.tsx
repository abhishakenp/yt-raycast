import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * OnlineCoursePricing — a 3-tier enrollment-plan band for an online-course
 * page. Thin configuration over the shared PricingGrid composite: a centered
 * heading + intro above a responsive 3-column grid of plan cards (name, price,
 * checkmark feature bullets, and a CTA). The middle "Pro" tier is highlighted
 * with a primary border, shadow, and a "Most popular" pill, and every CTA
 * routes through useNavigate. Use to present enrollment options — Free Audit,
 * Pro, Team — on an e-learning, bootcamp, or academy landing page. Renders
 * fully with no props via baked-in defaults.
 */
export const OnlineCoursePricing = defineComponent({
  name: 'OnlineCoursePricing',
  description:
    "A 3-tier enrollment-plan band for an online-course page built on the shared PricingGrid composite: a centered heading + intro above a responsive 3-column grid of plan cards (name, price, checkmark feature bullets, and a CTA). The middle 'Pro' tier is highlighted with a primary border, shadow, and a 'Most popular' pill, and every CTA routes through useNavigate. Use to present enrollment options — Free Audit, Pro, Team — on an e-learning, bootcamp, or academy landing page.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Pricing tiers (supply exactly 3); mark one with highlighted to feature it. */
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
    const heading = props.heading ?? 'Enroll your way'
    const subheading =
      props.subheading ??
      'Start free to preview the course, go Pro for the full certificate path, or bring your whole team.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free Audit',
            price: '$0',
            period: '',
            features: [
              'First module unlocked',
              'Community read access',
              'No certificate',
              'Cancel anytime',
            ],
            cta: 'Start free',
            highlighted: false,
          },
          {
            name: 'Pro',
            price: '$149',
            period: 'one-time',
            features: [
              'All modules & projects',
              'Certificate of completion',
              'Full community access',
              'Downloadable resources',
              'Lifetime updates',
            ],
            cta: 'Enroll now',
            highlighted: true,
          },
          {
            name: 'Team',
            price: '$99',
            period: 'per seat',
            features: [
              'Everything in Pro',
              '5+ seats',
              'Team progress dashboard',
              'Priority mentor support',
              'Invoicing & SSO',
            ],
            cta: 'Enroll now',
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
