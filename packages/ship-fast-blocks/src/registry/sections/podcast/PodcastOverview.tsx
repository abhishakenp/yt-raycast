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
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const PodcastOverview = defineCapsule({
  name: 'PodcastOverview',
  description:
    'Reusable audio-editorial overview / hero band for the Podcast page family, derived from the section template catalog for section-level coverage without new HTML generation. A mono-square eyebrow, uppercase brand kicker, a large extrabold heading, supporting copy, square dual CTAs with press feedback, hairline mono feature chips, and a collapsed-border tabular-nums KPI ledger sit beside an alt-driven image plate under a giant ghost watermark. Use when composing a podcast page or adding a focused podcast band to a larger generated site.',
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
    const brand = props.brand ?? 'Podcast'
    const eyebrow = props.eyebrow ?? 'Podcast section'
    const heading = props.heading ?? 'Podcast experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Podcast page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Podcast website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built podcast layout',
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
        <OverviewGrid className="relative">
          <Watermark className="-left-2 -top-6 text-[9rem] leading-none sm:text-[12rem]">
            EP
          </Watermark>
          <OverviewContent className="relative">
            <OverviewEyebrow className="rounded-none border-foreground/20 bg-transparent px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em]">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="font-mono tracking-[0.2em]">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {heading}
            </OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="rounded-none border-border bg-transparent font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform duration-150 hover:bg-foreground/90 active:translate-y-px"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-foreground bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform duration-150 hover:bg-muted active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="grid-cols-3 gap-0 border-l border-t border-border">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="border-b border-r border-border p-4"
                >
                  <OverviewStatValue className="font-mono tabular-nums">
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
