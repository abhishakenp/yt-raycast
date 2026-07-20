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
export const UniversityOverview = defineCapsule({
  name: 'UniversityOverview',
  description:
    'Reusable editorial-academic overview section for the University page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: an asymmetric split pairs a mono squared eyebrow, a mono brand kicker, a large serif heading, supporting copy, a hairline feature ledger (open border-top rows rather than pills), square dual CTAs with press feedback, and a mono tabular KPI strip against an image panel rendered through the alt-driven Image component. Use when composing a university page or adding a focused university band to a larger generated site.',
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
    const brand = props.brand ?? 'University'
    const eyebrow = props.eyebrow ?? 'University section'
    const heading = props.heading ?? 'University experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing University page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'University website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built university layout',
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
        <OverviewGrid className="lg:grid-cols-[1.15fr_0.85fr]">
          <OverviewContent>
            <OverviewEyebrow className="mb-6 w-fit rounded-none border-foreground/20 bg-transparent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {heading}
            </OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures className="mt-8 flex-col gap-0 border-t border-border">
              {features.map((feature: string, i: number) => (
                <OverviewFeature
                  key={feature}
                  className="flex w-full items-center gap-4 rounded-none border-0 border-b border-border bg-transparent px-0 py-3.5 text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] tabular-nums text-muted-foreground"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="rounded-none bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-150 hover:bg-primary/90 active:translate-y-px"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="rounded-none border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform duration-150 hover:bg-muted active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="mt-12 border-border">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat key={stat.label}>
                  <OverviewStatValue className="font-serif text-2xl font-semibold tabular-nums text-foreground">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
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
