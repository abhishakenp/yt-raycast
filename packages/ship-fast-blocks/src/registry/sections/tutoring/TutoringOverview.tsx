import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Image } from '#/lib/img.tsx'
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
export const TutoringOverview = defineCapsule({
  name: 'TutoringOverview',
  description:
    'Reusable editorial-academic overview / hero section for the Tutoring page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: a mono eyebrow + brand label, a warm serif heading, supporting copy, hairline mono feature chips, dual sharp-cornered route-link CTAs (hard-offset-shadow primary + bracketed outline, both with press feedback), a collapsed-border tabular KPI ledger, and an alt-driven catalog image plate with a sharp-cornered hairline frame, hard offset shadow, and a mono caption bar. Use when composing a tutoring page or adding a focused tutoring band to a larger generated site.',
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
    const brand = props.brand ?? 'Tutoring'
    const eyebrow = props.eyebrow ?? 'Tutoring section'
    const heading = props.heading ?? 'Tutoring experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Tutoring page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Tutoring website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built tutoring layout',
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
        <OverviewGrid className="lg:grid-cols-[1.4fr_1fr]">
          <OverviewContent>
            <OverviewEyebrow className="mb-4 rounded-none border-0 bg-transparent px-0 py-0 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground/70">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="font-serif font-semibold tracking-tight">
              {heading}
            </OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="rounded-none border-border bg-transparent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-[6px_6px_0_0] shadow-primary/25 transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-y-px active:shadow-none"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center gap-2 rounded-none border border-border bg-background px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
                href={secondaryCta}
              >
                <span aria-hidden="true">[</span>
                {secondaryCta}
                <span aria-hidden="true">]</span>
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="mt-10 gap-0 border-l border-t border-border pt-0">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="border-b border-r border-border p-4"
                >
                  <OverviewStatValue className="font-mono text-3xl font-semibold tabular-nums tracking-tight">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70">
                    {stat.label}
                  </OverviewStatLabel>
                </OverviewStat>
              ))}
            </OverviewStats>
          </OverviewContent>
          <div
            data-slot="overview-image-panel"
            className="relative overflow-hidden border border-border bg-card shadow-[10px_10px_0_0] shadow-foreground/10"
          >
            <Image
              alt={imageAlt}
              w={900}
              h={700}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="border-t border-border bg-card p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                {brand}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Section-level building block for generated multi-page
                experiences.
              </p>
            </div>
          </div>
        </OverviewGrid>
      </OverviewSection>
    )
  },
})
