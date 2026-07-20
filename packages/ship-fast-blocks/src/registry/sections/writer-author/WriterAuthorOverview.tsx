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
 * WriterAuthorOverview — reusable literary-editorial overview band for the
 * Writer Author page family. A mono manuscript eyebrow and brand line sit above
 * a serif heading and supporting copy, rounded-none manuscript feature chips,
 * two rounded-none CTAs that press on click, and a collapsed-border stat ledger
 * (hairline cells with tabular numerals over mono labels), beside an alt-driven
 * image panel. Derived from the section template catalog to provide section-
 * level coverage without new HTML generation. Use when composing a writer
 * author page or adding a focused writer author band to a larger generated site.
 */
export const WriterAuthorOverview = defineCapsule({
  name: 'WriterAuthorOverview',
  description:
    'Reusable literary-editorial overview / hero section for the Writer Author page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: a mono manuscript eyebrow and brand line, a serif heading, supporting copy, dual rounded-none CTAs, rounded-none feature chips, a collapsed-border KPI ledger with tabular numerals over mono labels, and an image panel rendered through the alt-driven Image component. Use when composing a writer author page or adding a focused writer author band to a larger generated site.',
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
    const brand = props.brand ?? 'Writer Author'
    const eyebrow = props.eyebrow ?? 'Writer Author section'
    const heading =
      props.heading ?? 'Writer Author experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Writer Author page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Writer Author website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built writer author layout',
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
            <OverviewEyebrow className="mb-6 rounded-none border-0 bg-transparent px-0 py-0 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="font-mono text-[11px] tracking-[0.2em]">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="font-serif font-normal tracking-tight">
              {heading}
            </OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="rounded-none border-foreground/15"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="rounded-none bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[4px_4px_0_0] shadow-primary/25 transition-transform duration-100 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="rounded-none border-2 border-foreground/20 bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform duration-100 hover:bg-muted active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="mt-12 grid-cols-3 gap-0 border-l border-t border-border pt-0">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="border-b border-r border-border p-4"
                >
                  <OverviewStatValue className="font-serif text-3xl font-normal tabular-nums">
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
