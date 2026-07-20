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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * TelehealthOverview — calm clinical + warmth reusable overview / hero section
 * for the Telehealth page family. On an airy band with a giant ghost "+"
 * watermark: a left column with a square hairline mono eyebrow, a mono brand
 * line, a large extrabold heading, supporting copy, dual square CTAs (a
 * filled-primary button plus an outlined button, both with press feedback), a
 * row of square hairline feature chips, and a collapsed-border KPI ledger with
 * giant tabular numerals and mono micro-labels; the right column shows a
 * hairline double-framed image panel with a mono brand caption rendered through
 * the alt-driven Image component. Precise yet warm, telemedicine aesthetic. Use
 * when composing a telehealth page or adding a focused telehealth band to a
 * larger generated site.
 */
export const TelehealthOverview = defineCapsule({
  name: 'TelehealthOverview',
  description:
    'Calm clinical + warmth reusable overview / hero section for the Telehealth page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: an airy band with a giant ghost "+" watermark, a left column with a square hairline mono eyebrow, mono brand line, large extrabold heading, supporting copy, dual square CTAs (filled-primary + outlined, both with press feedback), a row of square hairline feature chips, and a collapsed-border KPI ledger with giant tabular numerals and mono micro-labels, and a right column with a hairline double-framed image panel rendered through the alt-driven Image component. Precise yet warm, telemedicine aesthetic. Use when composing a telehealth page or adding a focused telehealth band to a larger generated site.',
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
    const brand = props.brand ?? 'Telehealth'
    const eyebrow = props.eyebrow ?? 'Telehealth section'
    const heading = props.heading ?? 'Telehealth experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Telehealth page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Telehealth website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built telehealth layout',
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
        <Watermark className="-top-16 right-[-3rem] text-[13rem] sm:right-[-5rem] sm:text-[18rem]">
          +
        </Watermark>
        <OverviewGrid className="relative">
          <OverviewContent>
            <OverviewEyebrow className="mb-6 w-fit rounded-none border-border bg-muted/40 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:leading-[1.02]">
              {heading}
            </OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="rounded-none border-border bg-background text-foreground/80"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-foreground/25 bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="mt-12 gap-0 border-l border-t border-border pt-0">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="gap-2 border-b border-r border-border p-5"
                >
                  <OverviewStatValue className="text-3xl font-extrabold tracking-tight tabular-nums text-foreground sm:text-4xl">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="mt-0 font-mono text-[10px] uppercase tracking-[0.16em]">
                    {stat.label}
                  </OverviewStatLabel>
                </OverviewStat>
              ))}
            </OverviewStats>
          </OverviewContent>
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 border border-border sm:-inset-4"
            />
            <div className="overflow-hidden rounded-none border border-border bg-muted">
              <Image
                alt={imageAlt}
                w={900}
                h={700}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="border-t border-border bg-background p-5">
                <MonoTag tone="muted" className="block">
                  {brand}
                </MonoTag>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
