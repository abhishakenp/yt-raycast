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
export const WeddingOverview = defineCapsule({
  name: 'WeddingOverview',
  description:
    'Reusable romantic-editorial overview / hero section for the Wedding page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: on a soft muted wash with a giant ghost watermark word, a mono eyebrow chip, a serif-italic heading, supporting copy, dual sharp-cornered CTAs with press feedback, hairline feature chips, a tabular KPI strip, and an image panel rendered through the alt-driven Image component. Use when composing a wedding page or adding a focused wedding band to a larger generated site.',
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
    const brand = props.brand ?? 'Wedding'
    const eyebrow = props.eyebrow ?? 'Wedding section'
    const heading = props.heading ?? 'Wedding experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Wedding page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Wedding website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built wedding layout',
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
        className={cn('relative overflow-hidden bg-muted/30', props.className)}
      >
        <Watermark className="-top-4 -right-4 font-serif text-[10rem] font-normal italic leading-none sm:text-[15rem]">
          &amp;
        </Watermark>
        <OverviewGrid className="relative">
          <OverviewContent>
            <OverviewEyebrow className="rounded-none border-border bg-background px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.2em]">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="font-mono text-[11px] tracking-[0.2em]">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="font-serif text-4xl font-normal italic leading-[1.05] tracking-tight sm:text-5xl">
              {heading}
            </OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="rounded-none border-border bg-background font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-border bg-background px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="border-border">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat key={stat.label}>
                  <OverviewStatValue className="font-serif text-3xl font-normal tabular-nums">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="font-mono text-[11px] uppercase tracking-[0.12em]">
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
