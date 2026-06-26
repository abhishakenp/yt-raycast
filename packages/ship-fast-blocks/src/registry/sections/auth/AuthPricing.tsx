import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * AuthPricing — three-tier pricing table for Authly, a developer authentication
 * product. Thin configuration over the shared `PricingGrid` composite: a centered
 * heading ("Simple, usage-based pricing") above Free, Pro (highlighted), and
 * Enterprise plans, each listing the included MAUs, auth features, and support
 * level. Free and Pro CTAs route to sign-up while Enterprise routes to a sales
 * contact. Use to price an auth platform, identity API, or login SDK. Renders
 * fully with no props.
 */
export const AuthPricing = defineComponent({
  name: 'AuthPricing',
  description:
    "Three-tier pricing table for a developer-auth product built on the shared PricingGrid composite: a centered heading ('Simple, usage-based pricing') above Free, Pro (highlighted), and Enterprise plans, each listing included MAUs, auth features, and support level. Free and Pro CTAs route to sign-up; Enterprise routes to a sales contact. Use to price an auth platform, identity API, or login SDK.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading. */
    subheading: z.string().optional(),
    /** Pricing tiers. */
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
    const heading = props.heading ?? 'Simple, usage-based pricing'
    const subheading =
      props.subheading ??
      'Start free and only pay as your monthly active users grow. No seat fees, no surprises.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free',
            price: '$0',
            period: '/ mo',
            features: [
              '10,000 monthly active users',
              'Social & email login',
              'Magic links & passkeys',
              'Community support',
            ],
            cta: 'Start Free',
            ctaTarget: 'Sign Up',
          },
          {
            name: 'Pro',
            price: '$99',
            period: '/ mo',
            highlighted: true,
            features: [
              '100,000 monthly active users',
              'MFA & 2FA enforcement',
              'User management dashboard',
              'Custom domains & branding',
              'Email support',
            ],
            cta: 'Start Pro',
            ctaTarget: 'Sign Up',
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            features: [
              'Unlimited monthly active users',
              'SSO / SAML & SCIM',
              'Advanced fraud protection',
              '99.99% uptime SLA',
              'Dedicated support & SLAs',
            ],
            cta: 'Contact Sales',
            ctaTarget: 'Contact Sales',
          },
        ]

    return (
      <PricingGrid
        heading={heading}
        subheading={subheading}
        tiers={tiers}
        className={props.className}
      />
    )
  },
})
