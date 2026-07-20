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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * RealEstateOverview — editorial-listings overview band for the Real Estate
 * page family. An asymmetric 7:5 split: on the left a mono metadata rail
 * (eyebrow + brand), a serif heading, supporting copy, an open collapsed-border
 * feature ledger (hairline rows with a small primary marker), two sharp-cornered
 * route CTAs with press feedback, and a KPI strip with giant tabular numerals;
 * on the right the alt-driven property photo sits in a sharp hairline frame with
 * a hard offset shadow. Derived from the section template catalog for
 * section-level coverage without new HTML generation. Use when composing a real
 * estate page or adding a focused real estate band to a larger generated site.
 */
export const RealEstateOverview = defineCapsule({
  name: 'RealEstateOverview',
  description:
    'Reusable editorial overview / hero section for the Real Estate page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: an asymmetric 7:5 split with a mono eyebrow + brand rail, a serif heading, supporting copy, an open collapsed-border feature ledger, two sharp-cornered route CTAs with press feedback, a KPI strip with giant tabular numerals, and an alt-driven property photo in a sharp hairline frame with a hard offset shadow rendered through the Image component. Use when composing a real estate page or adding a focused real estate band to a larger generated site.',
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
    const brand = props.brand ?? 'Real Estate'
    const eyebrow = props.eyebrow ?? 'Real Estate section'
    const heading =
      props.heading ?? 'Real Estate experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Real Estate page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Real Estate website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built real estate layout',
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
        <OverviewGrid className="lg:grid-cols-12 lg:items-start lg:gap-14">
          <OverviewContent className="lg:col-span-7">
            {/* Mono metadata rail. */}
            <div className="flex items-center gap-4">
              <OverviewEyebrow className="mb-0 rounded-none border-0 bg-transparent px-0 py-0 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {eyebrow}
              </OverviewEyebrow>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>
            <OverviewBrand className="mt-5 mb-0 font-mono text-[11px] tracking-[0.22em]">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="mt-3 max-w-xl font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
              {heading}
            </OverviewHeading>
            <OverviewSubheading className="max-w-lg">
              {subheading}
            </OverviewSubheading>

            {/* Open collapsed-border feature ledger. */}
            <OverviewFeatures className="mt-8 flex-col gap-0 border-b border-border">
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="flex w-full items-center gap-3 rounded-none border-0 border-t border-border bg-transparent px-0 py-3.5 text-sm text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 bg-primary"
                  />
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>

            <OverviewCta className="gap-3">
              <NavbarRouteLink
                className="inline-flex items-center justify-center whitespace-nowrap rounded-none bg-foreground px-6 py-3 text-sm font-medium text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center whitespace-nowrap rounded-none border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>

            {/* KPI strip with giant tabular numerals. */}
            <OverviewStats className="mt-12 gap-0 border-t border-border">
              {stats.map(
                (stat: { value: string; label: string }, i: number) => (
                  <OverviewStat
                    key={stat.label}
                    className={
                      i > 0 ? 'border-l border-border pl-5' : undefined
                    }
                  >
                    <OverviewStatValue className="text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
                      {stat.value}
                    </OverviewStatValue>
                    <OverviewStatLabel className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em]">
                      {stat.label}
                    </OverviewStatLabel>
                  </OverviewStat>
                ),
              )}
            </OverviewStats>
          </OverviewContent>

          <div className="relative lg:col-span-5 lg:pt-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-border"
            />
            <OverviewMediaPanel
              alt={imageAlt}
              brand={brand}
              caption="Section-level building block for generated multi-page experiences."
              className="relative [&>div:first-child]:hidden [&>div:last-child]:rounded-none [&>div:last-child]:border-border [&>div:last-child]:shadow-none [&_img]:rounded-none"
            />
          </div>
        </OverviewGrid>
      </OverviewSection>
    )
  },
})
