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
 * ResumeCvOverview — dark ink-inverted overview band for the Resume Cv page
 * family. The page's single `bg-foreground` / `text-background` inversion,
 * cutting in on a slanted clip-path seam over a giant faint ghost watermark: a
 * mono eyebrow + accent brand tag, a giant extrabold clamp heading, supporting
 * copy, square mono feature chips, two square CTAs with press feedback, and a
 * collapsed-border tabular KPI ledger, paired with an alt-driven image plate.
 * Tokens-only inversion so it adapts to light/dark and generated themes. Use
 * when composing a resume cv page or adding a focused, dramatic resume cv band
 * to a larger generated site.
 */
export const ResumeCvOverview = defineCapsule({
  name: 'ResumeCvOverview',
  description:
    'Dark ink-inverted overview / statement band for the Resume Cv page family, derived from the section template catalog to provide section-level coverage without new HTML generation: a bg-foreground/text-background inversion on a slanted clip-path seam over a giant faint ghost watermark, with a mono eyebrow and accent brand tag, a giant extrabold clamp heading, supporting copy, square mono feature chips, two square CTAs with press feedback, a collapsed-border tabular KPI ledger, and an alt-driven image plate. Use when composing a resume cv page or adding a focused resume cv band to a larger generated site.',
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
    const brand = props.brand ?? 'Resume Cv'
    const eyebrow = props.eyebrow ?? 'Resume Cv section'
    const heading = props.heading ?? 'Resume Cv experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Resume Cv page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Resume Cv website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built resume cv layout',
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
        className={[
          'relative bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-24 lg:pt-36',
          props.className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Giant faint ghost watermark. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-14 -left-4 select-none font-extrabold leading-none tracking-tighter text-background/[0.05] text-[10rem] sm:text-[15rem] lg:text-[19rem]"
        >
          CV
        </span>

        <OverviewGrid className="relative lg:grid-cols-[1.15fr_0.85fr]">
          <OverviewContent>
            <OverviewEyebrow className="mb-4 rounded-none border-transparent bg-transparent px-0 py-0 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-background/55">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="font-extrabold leading-[0.95] tracking-tighter text-background text-[clamp(2rem,5vw,3.5rem)] sm:text-[clamp(2rem,5vw,3.5rem)]">
              {heading}
            </OverviewHeading>
            <OverviewSubheading className="text-background/60">
              {subheading}
            </OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="rounded-none border-background/20 bg-transparent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-background/70"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="rounded-none bg-background px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-transform duration-150 hover:bg-background/90 active:translate-y-px"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="rounded-none border-2 border-background/40 bg-transparent px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-background transition-transform duration-150 hover:bg-background/10 active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="mt-12 grid-cols-3 gap-0 border-l border-t border-background/20 pt-0">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="border-b border-r border-background/20 p-4 sm:p-5"
                >
                  <OverviewStatValue className="font-extrabold leading-none tracking-tight text-background tabular-nums text-[clamp(1.75rem,4vw,3rem)]">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-background/55">
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
