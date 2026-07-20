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
/**
 * WineryBreweryOverview — artisan-editorial overview band for the Winery
 * Brewery page family. Over a giant faint ghost watermark, an asymmetric split
 * pairs a left content column (mono brand rail, square hairline label-stamp
 * eyebrow, large serif heading, supporting copy, square-edged dual CTAs with
 * press feedback, mono feature label-stamps, and a collapsed-border tabular
 * stat ledger) with a right alt-driven image panel. CTAs route through
 * section-kit route links. Use when composing a winery brewery page or adding a
 * focused winery brewery band to a larger generated site.
 */
export const WineryBreweryOverview = defineCapsule({
  name: 'WineryBreweryOverview',
  description:
    'Artisan-editorial overview band for the Winery Brewery page family: over a giant faint ghost watermark, an asymmetric split pairs a left content column (mono brand rail, square hairline label-stamp eyebrow, large serif heading, supporting copy, square-edged dual CTAs with press feedback, mono feature label-stamps, and a collapsed-border tabular stat ledger) with a right alt-driven image panel. CTAs route through section-kit route links. Use when composing a winery brewery page or adding a focused winery brewery band to a larger generated site.',
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
    const brand = props.brand ?? 'Winery Brewery'
    const eyebrow = props.eyebrow ?? 'Winery Brewery section'
    const heading =
      props.heading ?? 'Winery Brewery experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Winery Brewery page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Winery Brewery website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built winery brewery layout',
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
        <Watermark className="-bottom-10 -right-4 font-serif text-[8rem] font-medium italic sm:text-[12rem] lg:text-[17rem]">
          Vintage
        </Watermark>
        <OverviewGrid className="relative lg:grid-cols-[1.2fr_0.8fr]">
          <OverviewContent>
            <div className="mb-6 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 bg-primary"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                {brand}
              </span>
            </div>
            <OverviewEyebrow className="-rotate-1 rounded-none border-border bg-transparent font-mono text-[11px] uppercase tracking-[0.16em]">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="sr-only">{brand}</OverviewBrand>
            <OverviewHeading className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">
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
                className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-[transform,background-color] duration-150 hover:bg-primary/90 active:translate-y-px"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-border bg-background px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="mt-12 grid-cols-3 gap-0 border-l border-t border-border pt-0">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="border-b border-r border-border p-4 sm:p-5"
                >
                  <OverviewStatValue className="font-mono text-3xl font-medium tabular-nums tracking-tight">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em]">
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
