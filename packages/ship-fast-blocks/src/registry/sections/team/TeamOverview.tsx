import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
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
  OverviewImagePanel,
} from '#/section-kit/OverviewSection.tsx'

export const TeamOverview = defineCapsule({
  name: 'TeamOverview',
  description:
    'Reusable overview / hero section for the Team page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: eyebrow, large heading, supporting copy, dual CTAs, feature pills, KPI strip, and an image panel rendered through the alt-driven Image component. Use when composing a team page or adding a focused team band to a larger generated site.',
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
    const go = useNavigate()
    const brand = props.brand ?? 'Team'
    const eyebrow = props.eyebrow ?? 'Team section'
    const heading = props.heading ?? 'Team experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Team page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Meet the team'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Team website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built team layout',
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
              <button
                type="button"
                onClick={() => go(primaryCta)}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryCta)}
                className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                {secondaryCta}
              </button>
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
          <OverviewImagePanel
            alt={imageAlt}
            brand={brand}
            caption="Section-level building block for generated multi-page experiences."
          />
        </OverviewGrid>
      </OverviewSection>
    )
  },
})
