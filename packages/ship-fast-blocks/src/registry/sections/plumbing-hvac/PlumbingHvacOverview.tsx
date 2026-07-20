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
 * PlumbingHvacOverview — a reusable trade-industrial overview band for the
 * Plumbing Hvac page family, derived from the section template catalog to give
 * section-level coverage without new HTML generation. Built on the shared
 * `OverviewSection` composite in a tech-brutalist-lite key: a squared mono
 * eyebrow + mono brand kicker, an extrabold slab heading, supporting copy,
 * squared border-2 feature chips, dual squared CTAs (a hard-shadow primary with
 * press feedback plus a bordered secondary), a collapsed-border KPI ledger with
 * tabular numerals and mono labels, and an alt-driven image panel. Use when
 * composing a plumbing hvac page or adding a focused plumbing hvac band to a
 * larger generated site.
 */
export const PlumbingHvacOverview = defineCapsule({
  name: 'PlumbingHvacOverview',
  description:
    'Reusable trade-industrial overview / hero band for the Plumbing Hvac page family, derived from the section template catalog to provide section-level coverage without new HTML generation: a squared mono eyebrow + mono brand kicker, an extrabold slab heading, supporting copy, squared border-2 feature chips, dual squared CTAs (a hard-shadow primary with press feedback plus a bordered secondary), a collapsed-border KPI ledger with tabular numerals and mono labels, and an image panel rendered through the alt-driven Image component. Use when composing a plumbing hvac page or adding a focused plumbing hvac band to a larger generated site.',
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
    const brand = props.brand ?? 'Plumbing Hvac'
    const eyebrow = props.eyebrow ?? 'Plumbing Hvac section'
    const heading =
      props.heading ?? 'Plumbing Hvac experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Plumbing Hvac page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Plumbing Hvac website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built plumbing hvac layout',
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
        <OverviewGrid>
          <OverviewContent>
            <OverviewEyebrow className="rounded-none border-2 border-foreground bg-transparent font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="font-mono uppercase tracking-[0.2em]">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
              {heading}
            </OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="rounded-none border-2 border-border font-medium"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0] active:translate-y-0 active:shadow-[2px_2px_0_0] motion-reduce:transform-none"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border-2 border-foreground bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all duration-150 hover:bg-foreground hover:text-background active:translate-y-px motion-reduce:transform-none"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="mt-12 grid grid-cols-3 gap-0 border-l-2 border-t-2 border-foreground pt-0">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="border-b-2 border-r-2 border-foreground p-4"
                >
                  <OverviewStatValue className="text-3xl font-extrabold tabular-nums tracking-tight md:text-4xl">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em]">
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
