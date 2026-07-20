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
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const PortfolioDevOverview = defineCapsule({
  name: 'PortfolioDevOverview',
  description:
    'Reusable editorial-terminal overview / hero band for the Portfolio Dev page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: a mono eyebrow and brand rule, a giant extrabold heading, supporting copy, dual square-cornered mono CTAs with press feedback, monospace feature chips, a tabular KPI strip, and an alt-driven image panel — over a faint dot grid and a giant ghost `</>` watermark. Use when composing a portfolio dev page or adding a focused portfolio dev band to a larger generated site.',
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
    const brand = props.brand ?? 'Portfolio Dev'
    const eyebrow = props.eyebrow ?? 'Portfolio Dev section'
    const heading =
      props.heading ?? 'Portfolio Dev experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Portfolio Dev page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Portfolio Dev website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built portfolio dev layout',
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
      <OverviewSection className={cn('relative bg-muted/40', props.className)}>
        <DotGrid
          density="default"
          tone="faint"
          fade="bottom"
          className="inset-x-0 top-0 h-56"
        />
        <Watermark className="-bottom-14 -left-4 font-mono text-[8rem] leading-none sm:text-[13rem]">
          {'</>'}
        </Watermark>
        <OverviewGrid className="relative">
          <OverviewContent>
            <OverviewEyebrow className="mb-5 inline-flex items-center gap-2 rounded-none border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span aria-hidden="true" className="size-2 bg-primary" />
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="mb-4 font-mono text-[11px] tracking-[0.2em]">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="text-4xl font-extrabold leading-[0.95] tracking-tighter sm:text-5xl">
              {heading}
            </OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="rounded-none border-border bg-background font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-foreground/25 bg-background px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="border-border">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat key={stat.label}>
                  <OverviewStatValue className="font-semibold tabular-nums tracking-tight">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="font-mono text-[11px] uppercase tracking-[0.16em]">
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
