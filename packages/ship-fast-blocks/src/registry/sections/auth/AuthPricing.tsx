import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PricingCard,
  PricingCardBadge,
  PricingCardName,
  PricingCardPrice,
  PricingCardPriceValue,
  PricingCardPriceUnit,
  PricingCardFeatures,
  PricingCardFeature,
  PricingCardCheckIcon,
  PricingCardCta,
} from '#/section-kit/PricingCard.tsx'

/**
 * AuthPricing — three-tier pricing table for Authly, a developer authentication
 * product. Thin configuration over the shared `PricingGrid` composite: a centered
 * heading ("Simple, usage-based pricing") above Free, Pro (highlighted), and
 * Enterprise plans, each listing the included MAUs, auth features, and support
 * level. Free and Pro CTAs route to sign-up while Enterprise routes to a sales
 * contact. Use to price an auth platform, identity API, or login SDK. Renders
 * fully with no props.
 */
export const AuthPricing = defineCapsule({
  name: 'AuthPricing',
  description:
    "Three-tier pricing table for a developer-auth product backed by shared Lakebed conversion state: a centered heading ('Simple, usage-based pricing') above Free, Pro (highlighted), and Enterprise plans, each listing included MAUs, auth features, and support level. Plans seed the command search catalog; scoped CTAs record sign-up or sales intent without fake navigation. Use to price an auth platform, identity API, or login SDK.",
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
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
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

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.features?.at(0) ?? '',
        }),
      ),
    )

    return (
      <section className={cn('bg-background py-20 sm:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            title={heading}
            subtitle={subheading}
            align="center"
            titleClassName="tracking-tight"
            subtitleClassName="leading-7"
            className="mx-auto max-w-3xl"
          />

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <PricingCard
                key={tier.name}
                variant="outlined"
                highlight={tier.highlighted ? 'primary' : 'none'}
                className={tier.highlighted ? undefined : 'border-border'}
              >
                {tier.highlighted ? (
                  <PricingCardBadge>Most popular</PricingCardBadge>
                ) : null}
                <PricingCardName>{tier.name}</PricingCardName>
                <PricingCardPrice>
                  <PricingCardPriceValue>{tier.price}</PricingCardPriceValue>
                  {tier.period ? (
                    <PricingCardPriceUnit>{tier.period}</PricingCardPriceUnit>
                  ) : null}
                </PricingCardPrice>
                {tier.features?.length ? (
                  <PricingCardFeatures>
                    {tier.features.map((feature) => (
                      <PricingCardFeature key={feature}>
                        <PricingCardCheckIcon />
                        <span>{feature}</span>
                      </PricingCardFeature>
                    ))}
                  </PricingCardFeatures>
                ) : null}
                <PricingCardCta asChild>
                  <SaasPlanActionButton
                    lakebed={lakebed}
                    intentLabel={tier.ctaTarget ?? tier.cta ?? 'Start Free'}
                    plan={tier.name}
                    source="pricing"
                    aria-label={`${tier.cta ?? 'Start Free'} for ${tier.name}`}
                    pendingChildren={
                      <>
                        <SaasMutationSpinner className="size-4" />
                        Selecting
                      </>
                    }
                    className={cn(
                      'inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-70',
                      tier.highlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-border bg-background text-foreground hover:bg-muted',
                    )}
                  >
                    {tier.cta ?? 'Start Free'}
                  </SaasPlanActionButton>
                </PricingCardCta>
              </PricingCard>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
