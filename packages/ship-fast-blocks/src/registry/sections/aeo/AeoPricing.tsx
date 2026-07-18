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
 * AeoPricing — three-tier pricing for an Answer-Engine-Optimization (AEO) SaaS.
 * Thin configuration over the shared PricingGrid composite: a centered heading
 * block above Starter, Growth (highlighted as "Most popular"), and Enterprise
 * tiers, each with a monthly price, a feature list, and a routable CTA. Use to
 * convert prospects on AEO, generative-search visibility, or brand-citation
 * analytics pages. Renders fully with no props via baked-in defaults.
 */
export const AeoPricing = defineCapsule({
  name: 'AeoPricing',
  description:
    "Three-tier pricing for an Answer-Engine-Optimization (AEO) product backed by shared Lakebed conversion state: a centered heading block above Starter, Growth (highlighted as 'Most popular'), and Enterprise tiers, each with a monthly price/period, feature list, and scoped fullstack CTA. Plans seed the command search catalog and selected tiers update shared conversion state. Use to convert prospects on AEO, generative-search visibility, or brand-citation analytics landing pages.",
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
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Starter',
            price: '$49',
            period: '/mo',
            features: [
              '1 brand, 50 tracked prompts',
              'ChatGPT & Perplexity tracking',
              'Weekly citation reports',
              'Core optimization recommendations',
            ],
            cta: 'Start Free',
            ctaTarget: 'Start Free',
          },
          {
            name: 'Growth',
            price: '$199',
            period: '/mo',
            features: [
              '3 brands, 500 tracked prompts',
              'All answer engines incl. AI Overviews',
              'Share-of-voice & competitor tracking',
              'Change alerts & prompt opportunities',
              'Priority support',
            ],
            cta: 'Start Free',
            ctaTarget: 'Start Free',
            highlighted: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            features: [
              'Unlimited brands & prompts',
              'API access & data exports',
              'Dedicated strategist & SSO',
              'Custom integrations & SLAs',
              'Executive reporting',
            ],
            cta: 'Book demo',
            ctaTarget: 'Book demo',
          },
        ]
    const heading =
      props.heading ?? 'Pricing that scales with your AI visibility'
    const subheading =
      props.subheading ??
      'Start free, then upgrade as you track more prompts, brands, and answer engines. No setup fees.'

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
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
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
              title={'Pricing that scales with your AI visibility'}
              subtitle={
                'Start free, then upgrade as you track more prompts, brands, and answer engines. No setup fees.'
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
