import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
import { propertyListingLakebed } from './property-listing-lakebed.ts'
import {
  PropertyListingInquiryButton,
  PropertyListingMutationSpinner,
} from './property-listing-interactions.tsx'

export const PropertyListingOverview = defineCapsule({
  name: 'PropertyListingOverview',
  description:
    'Editorial overview band for the Property Listing page family: an asymmetric split with a mono eyebrow (primary tick), a small uppercase brand line, an oversized extrabold tight-tracked heading, supporting copy, square mono feature chips, square fullstack inquiry CTAs with press feedback, and a collapsed-border KPI ledger with giant tabular values, beside a sharp hard-offset-shadow image panel rendered through the alt-driven Image component. Use when composing a property listing page or adding a focused property listing band to a larger generated site.',
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
  lakebed: propertyListingLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Property Listing'
    const eyebrow = props.eyebrow ?? 'Property Listing section'
    const heading =
      props.heading ?? 'Property Listing experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Property Listing page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Property Listing website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built property listing layout',
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
      <OverviewSection
        className={cn('relative overflow-hidden', props.className)}
      >
        <OverviewGrid className="lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <OverviewContent>
            <OverviewEyebrow className="mb-6 inline-flex items-center gap-2 self-start rounded-none border-0 bg-transparent p-0 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-tighter sm:text-5xl">
              {heading}
            </OverviewHeading>
            <OverviewSubheading className="mt-6 max-w-2xl text-lg leading-relaxed">
              {subheading}
            </OverviewSubheading>
            <OverviewFeatures className="mt-8 gap-2">
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="rounded-none border-border bg-transparent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta className="mt-10 grid grid-cols-2 gap-3 sm:flex">
              <PropertyListingInquiryButton
                lakebed={lakebed}
                intent={primaryCta}
                source="overview:primary"
                pendingChildren={
                  <>
                    <PropertyListingMutationSpinner className="size-4" />
                    Sending
                  </>
                }
                className="inline-flex items-center justify-center gap-2 rounded-none bg-foreground px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
              >
                {primaryCta}
              </PropertyListingInquiryButton>
              <PropertyListingInquiryButton
                lakebed={lakebed}
                intent={secondaryCta}
                source="overview:secondary"
                pendingChildren={
                  <>
                    <PropertyListingMutationSpinner className="size-4" />
                    Sending
                  </>
                }
                className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground/25 bg-transparent px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-150 hover:border-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
              >
                {secondaryCta}
              </PropertyListingInquiryButton>
            </OverviewCta>
            <OverviewStats className="mt-12 grid-cols-3 gap-0 border-l border-t border-border pt-0">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="border-b border-r border-border p-4 sm:p-5"
                >
                  <OverviewStatValue className="text-3xl font-extrabold leading-none tracking-tighter tabular-nums sm:text-4xl">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                    {stat.label}
                  </OverviewStatLabel>
                </OverviewStat>
              ))}
            </OverviewStats>
          </OverviewContent>
          <OverviewMediaPanel
            alt={imageAlt}
            brand={brand}
            caption="Section-level building block for generated multi-page experiences."
            className="mr-2 [&>div:first-child]:hidden [&>div:last-child]:rounded-none [&>div:last-child]:border-foreground/15 [&>div:last-child]:shadow-[8px_8px_0_0] [&>div:last-child]:shadow-foreground/15"
          />
        </OverviewGrid>
      </OverviewSection>
    )
  },
})
