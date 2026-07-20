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
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const WebinarOverview = defineCapsule({
  name: 'WebinarOverview',
  description:
    'Reusable kinetic-event overview / hero section for the Webinar page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: a mono square eyebrow, a countdown-scale extrabold heading, supporting copy, square-edged mono feature chips, square dual CTAs with a hard offset token shadow and press feedback, a hairline KPI strip with tabular numerals, and an image panel rendered through the alt-driven Image component, with a giant ghost watermark behind. Use when composing a webinar page or adding a focused webinar band to a larger generated site.',
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
    const brand = props.brand ?? 'Webinar'
    const eyebrow = props.eyebrow ?? 'Webinar section'
    const heading = props.heading ?? 'Webinar experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Webinar page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Webinar website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built webinar layout',
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
        <Watermark className="-right-6 top-6 text-[7rem] leading-none sm:text-[13rem] lg:text-[18rem]">
          {brand}
        </Watermark>
        <OverviewGrid className="relative">
          <OverviewContent>
            <OverviewEyebrow className="rounded-none border-foreground/60 bg-transparent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="font-mono">{brand}</OverviewBrand>
            <OverviewHeading className="font-extrabold tracking-tight">
              {heading}
            </OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="rounded-none border-border bg-transparent font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-foreground bg-primary px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] hover:shadow-foreground active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-foreground bg-background px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats>
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat key={stat.label}>
                  <OverviewStatValue className="text-3xl font-extrabold tabular-nums tracking-tight">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="font-mono text-[11px] uppercase tracking-[0.14em]">
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
          />
        </OverviewGrid>
      </OverviewSection>
    )
  },
})
