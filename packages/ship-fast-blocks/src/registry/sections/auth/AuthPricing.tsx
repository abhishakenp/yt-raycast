import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { saasPlan, useSyncSaasPlans } from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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

          <PricingGrid>
            <SectionHeading
              title={'Simple, usage-based pricing'}
              subtitle={
                'Start free and only pay as your monthly active users grow. No seat fees, no surprises.'
              }
            />
            {tiers.map((tier) => {
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
                    <PricingTierBadge>{t.badge ?? 'Popular'}</PricingTierBadge>
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
                    {t.unit && <PricingTierPeriod>{t.unit}</PricingTierPeriod>}
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
        </div>
      </section>
    )
  },
})
