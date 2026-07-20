import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
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
} from '#/section-kit/OverviewSection.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const VacationRentalOverview = defineCapsule({
  name: 'VacationRentalOverview',
  description:
    'Reusable editorial-wanderlust overview / hero section for the Vacation Rental page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: a mono index eyebrow, a stamp brand label, a large extrabold heading, supporting copy, dual sharp-cornered CTAs, sharp hairline amenity chips, a collapsed-border tabular KPI ledger, and a full-bleed sharp image plate with a mono caption ledger rendered through the alt-driven Image component. Use when composing a vacation rental page or adding a focused vacation rental band to a larger generated site.',
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
    const brand = props.brand ?? 'Vacation Rental'
    const eyebrow = props.eyebrow ?? 'Vacation Rental section'
    const heading =
      props.heading ?? 'Vacation Rental experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Vacation Rental page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Vacation Rental website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built vacation rental layout',
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
      <OverviewSection className={cn('relative', props.className)}>
        <Watermark className="-right-6 top-4 text-[13rem] leading-none">
          {brand.split(' ')[0]}
        </Watermark>
        <OverviewGrid className="relative lg:grid-cols-[7fr_5fr]">
          <OverviewContent>
            <OverviewEyebrow className="mb-6 w-fit rounded-none border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="mb-5 w-fit -rotate-1 border border-border px-2.5 py-1 font-mono text-[11px] normal-case tracking-[0.18em] text-muted-foreground">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              {heading}
            </OverviewHeading>
            <OverviewSubheading className="mt-6 max-w-xl">
              {subheading}
            </OverviewSubheading>
            <OverviewFeatures className="mt-8 gap-2.5">
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="rounded-none border-border bg-transparent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta className="mt-10">
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-foreground bg-background px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground transition-[background-color,color,transform] duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="mt-12 grid-cols-3 gap-0 border-l border-t border-border">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="border-b border-r border-border p-5"
                >
                  <OverviewStatValue className="text-3xl font-extrabold tabular-nums tracking-tight sm:text-4xl">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em]">
                    {stat.label}
                  </OverviewStatLabel>
                </OverviewStat>
              ))}
            </OverviewStats>
          </OverviewContent>
          <div className="relative">
            <div className="relative overflow-hidden border border-border bg-card">
              <Image
                alt={imageAlt}
                w={900}
                h={700}
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="absolute left-3 top-3 -rotate-2 border border-background/50 bg-foreground/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-background backdrop-blur-sm">
                {brand}
              </span>
              <div className="flex items-baseline justify-between gap-3 border-t border-border bg-card/95 p-5">
                <MonoTag>{brand}</MonoTag>
                <p className="max-w-[16rem] text-right text-sm leading-6 text-muted-foreground">
                  Section-level building block for generated multi-page
                  experiences.
                </p>
              </div>
            </div>
          </div>
        </OverviewGrid>
      </OverviewSection>
    )
  },
})
