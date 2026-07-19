import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { saasPlan, useSyncSaasPlans } from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * MobileAppPricing — a centered-intro, 3-tier pricing table for a clean,
 * minimalist mobile-app marketing page. A centered heading + description sits
 * above a responsive 3-column row of plan cards; the "featured" plan inverts to
 * the primary background, lifts slightly, and carries a "Most Popular" pill. Each
 * card shows a name, tagline, big price + period, a checklist of features
 * (check / cross icons, dimmed when excluded), and a full-width CTA button that
 * routes through useNavigate. Use as the plans / subscription section on a habit
 * tracker, fitness / wellness app, productivity or to-do app, or any consumer app
 * landing page. Renders fully with no props via baked-in Free / Pro / Teams
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
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
export const MobileAppPricing = defineCapsule({
  name: 'MobileAppPricing',
  description:
    'Centered-intro 3-tier pricing table backed by shared Lakebed conversion state: plan cards seed command search and each CTA records selected plan or sales intent with scoped loading. Use as the plans / subscription section on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          cta: z.string(),
          featured: z.boolean().optional(),
          features: z
            .array(
              z.object({
                label: z.string(),
                included: z.boolean(),
              }),
            )
            .optional(),
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
      "Start free, upgrade when you're ready. No hidden fees, no surprises."
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free',
            tagline: 'Perfect for getting started',
            price: '$0',
            period: '/month',
            cta: 'Get Started Free',
            featured: false,
            features: [
              {
                label: 'Up to 3 habits',
                included: true,
              },
              {
                label: 'Basic reminders',
                included: true,
              },
              {
                label: '7-day streak history',
                included: true,
              },
              {
                label: 'Accountability groups',
                included: false,
              },
              {
                label: 'Advanced insights',
                included: false,
              },
            ],
          },
          {
            name: 'Pro',
            tagline: 'For serious habit builders',
            price: '$4.99',
            period: '/month',
            cta: 'Start 14-Day Free Trial',
            featured: true,
            features: [
              {
                label: 'Unlimited habits',
                included: true,
              },
              {
                label: 'Smart AI reminders',
                included: true,
              },
              {
                label: 'Unlimited history',
                included: true,
              },
              {
                label: 'Accountability groups',
                included: true,
              },
              {
                label: 'Advanced insights & export',
                included: true,
              },
            ],
          },
          {
            name: 'Teams',
            tagline: 'For organizations',
            price: '$12',
            period: '/user/month',
            cta: 'Contact Sales',
            featured: false,
            features: [
              {
                label: 'Everything in Pro',
                included: true,
              },
              {
                label: 'Team challenges',
                included: true,
              },
              {
                label: 'Admin dashboard',
                included: true,
              },
              {
                label: 'SSO integration',
                included: true,
              },
              {
                label: 'Priority support',
                included: true,
              },
            ],
          },
        ]
    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.tagline || tier.features?.at(0)?.label || '',
        }),
      ),
    )
    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
    const CrossIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
    void CheckIcon
    void CrossIcon
    return (
      <section
        className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}
        aria-labelledby="mobileapp-pricing-heading"
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            titleId="mobileapp-pricing-heading"
            className="mb-16 lg:mb-20 max-w-2xl gap-0"
            titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <PricingGrid>
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
