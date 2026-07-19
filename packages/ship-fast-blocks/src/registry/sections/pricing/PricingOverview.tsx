import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  OverviewSection,
  OverviewGrid,
  OverviewContent,
  OverviewEyebrow,
  OverviewBrand,
  OverviewHeading,
  OverviewSubheading,
  OverviewFeatures,
  OverviewFeature,
  OverviewCta,
  OverviewStats,
  OverviewStat,
  OverviewStatValue,
  OverviewStatLabel,
  OverviewMediaPanel,
} from '#/section-kit/OverviewSection.tsx'
import { CtaAction } from '#/section-kit/CtaBand.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const PricingOverview = defineCapsule({
  name: 'PricingOverview',
  description:
    'Reusable overview / hero section for the Pricing page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: eyebrow, large heading, supporting copy, dual CTAs, feature pills, KPI strip, and an image panel rendered through the alt-driven Image component. Use when composing a pricing page or adding a focused pricing band to a larger generated site.',
  props: z.object({
    brand: z.string().optional(),
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    features: z.array(z.string()).optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Pricing'
    const eyebrow = props.eyebrow ?? 'Pricing section'
    const heading = props.heading ?? 'Pricing experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Pricing page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'View plans'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Pricing website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built pricing layout',
          'Token-based styling',
          'Prompt-safe content props',
        ]
    const stats = props.stats?.length
      ? props.stats
      : [
          {
            value: '01',
            label: 'Reusable section',
          },
          {
            value: '100%',
            label: 'Token compliant',
          },
          {
            value: '0',
            label: 'Image URLs',
          },
        ]

    return (
      <OverviewSection className={props.className}>
        <OverviewGrid>
          <OverviewContent>
            <OverviewEyebrow>{eyebrow}</OverviewEyebrow>
            <OverviewBrand>{brand}</OverviewBrand>
            <OverviewHeading>{heading}</OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string) => (
                <OverviewFeature key={feature}>{feature}</OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <CtaAction
                variant="primary"
                className="rounded-full px-6 py-3 text-sm font-semibold"
                asChild
              >
                <NavbarRouteLink href={primaryCta}>
                  {primaryCta}
                </NavbarRouteLink>
              </CtaAction>
              <CtaAction
                variant="outline"
                className="rounded-full bg-background px-6 py-3 text-sm font-semibold"
                asChild
              >
                <NavbarRouteLink href={secondaryCta}>
                  {secondaryCta}
                </NavbarRouteLink>
              </CtaAction>
            </OverviewCta>
            <OverviewStats>
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat key={stat.label}>
                  <OverviewStatValue>{stat.value}</OverviewStatValue>
                  <OverviewStatLabel>{stat.label}</OverviewStatLabel>
                </OverviewStat>
              ))}
            </OverviewStats>
          </OverviewContent>
          <OverviewMediaPanel
            alt={imageAlt}
            brand={brand}
            caption="Section-level building block for generated multi-page experiences."
          />
        </OverviewGrid>
      </OverviewSection>
    )
  },
})
