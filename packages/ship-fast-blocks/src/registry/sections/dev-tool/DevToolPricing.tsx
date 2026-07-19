import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { saasPlan, useSyncSaasPlans } from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * DevToolPricing — a 3-tier pricing table for a developer tool / API platform.
 * A muted-banded section with a centered heading + intro above a responsive
 * 3-column grid of plan cards (name, tagline, big price + period, a checklist of
 * features with brand checkmarks, and a CTA button). The featured tier gets a
 * brand-colored border, shadow, and a floating "Most Popular" pill. Every CTA
 * routes through section-kit route links. Use to present subscription tiers for developer
 * tools, API platforms, backend-as-a-service, or technical SaaS.
 */
export const DevToolPricing = defineCapsule({
  name: 'DevToolPricing',
  description:
    "3-tier pricing table for a developer tool / API platform backed by shared Lakebed conversion state: a muted-banded section with a centered heading + intro above a responsive 3-column grid of plan cards. Plans seed the command search catalog; each CTA records scoped sign-up or sales intent with local loading. The featured tier gets a brand-colored border, shadow, and a floating 'Most Popular' pill. Use to present subscription tiers for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    popularLabel: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Start free, scale as you grow. No hidden fees, no surprises.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Starter',
            tagline: 'For side projects and learning',
            price: '$0',
            period: '/month',
            features: [
              '10,000 API requests/month',
              '1 GB storage',
              'Community support',
              '3 team members',
            ],
            cta: 'Get Started',
            featured: false,
          },
          {
            name: 'Pro',
            tagline: 'For production applications',
            price: '$29',
            period: '/month',
            features: [
              '500,000 API requests/month',
              '50 GB storage',
              'Priority email support',
              '15 team members',
              'Custom domains & SSL',
            ],
            cta: 'Start Free Trial',
            featured: true,
          },
          {
            name: 'Enterprise',
            tagline: 'For large-scale teams',
            price: 'Custom',
            features: [
              'Unlimited API requests',
              'Unlimited storage',
              '24/7 phone & Slack support',
              'Unlimited team members',
              'SSO, audit logs, SLAs',
            ],
            cta: 'Contact Sales',
            featured: false,
          },
        ]

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.tagline,
        }),
      ),
    )

    return (
      <section
        className={cn('bg-muted/40 py-20 lg:py-28', props.className)}
        aria-labelledby="pricing-heading"
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mx-auto mb-16 max-w-3xl gap-0"
            titleId="pricing-heading"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <PricingGrid>
            <SectionHeading
              title={'Simple, transparent pricing'}
              subtitle={
                'Start free, scale as you grow. No hidden fees, no surprises.'
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
        </Container>
      </section>
    )
  },
})
