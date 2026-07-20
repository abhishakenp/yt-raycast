import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Image } from '#/lib/img.tsx'
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
} from '#/section-kit/OverviewSection.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const SpaWellnessOverview = defineCapsule({
  name: 'SpaWellnessOverview',
  description:
    'Reusable airy calm-luxury overview band for the Spa Wellness page family, restyled on the shared OverviewSection kit slots for section-level coverage without new HTML generation: a soft muted wash with a ghost watermark, an asymmetric split pairing a mono eyebrow, delicate serif heading, calming copy, mono feature chips, sharp-cornered dual CTAs and a hairline tabular KPI strip on the left with a hairline double-framed image panel (rendered through the alt-driven Image component) on the right. Use when composing a spa wellness page or adding a focused spa wellness band to a larger generated site.',
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
    const brand = props.brand ?? 'Spa Wellness'
    const eyebrow = props.eyebrow ?? 'Spa Wellness section'
    const heading =
      props.heading ?? 'Spa Wellness experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Spa Wellness page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Spa Wellness website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built spa wellness layout',
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
        className={
          'relative overflow-hidden bg-muted/30' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Watermark className="-top-4 -right-4 font-serif text-[7rem] font-normal tracking-tight sm:text-[11rem] lg:text-[15rem]">
          {brand}
        </Watermark>
        <OverviewGrid className="relative">
          <OverviewContent>
            <OverviewEyebrow className="w-fit rounded-none border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="mt-2 font-mono text-[11px] tracking-[0.14em] text-primary">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="mt-4 font-serif text-4xl font-normal tracking-tight text-foreground sm:text-5xl">
              {heading}
            </OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string) => (
                <OverviewFeature
                  key={feature}
                  className="inline-flex items-center gap-2 rounded-none border-border bg-background font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-primary"
                  />
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-foreground/25 bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="gap-0 divide-x divide-border border border-border">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat key={stat.label} className="px-5 py-4 first:pl-5">
                  <OverviewStatValue className="font-serif text-3xl font-medium tabular-nums">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="font-mono text-[11px] uppercase tracking-[0.12em]">
                    {stat.label}
                  </OverviewStatLabel>
                </OverviewStat>
              ))}
            </OverviewStats>
          </OverviewContent>
          <div className="relative lg:pl-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 border border-border"
            />
            <div className="relative overflow-hidden border border-border bg-card">
              <Image
                alt={imageAlt}
                w={900}
                h={700}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="border-t border-border bg-background p-6">
                <p className="font-serif text-base font-medium text-foreground">
                  {brand}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Section-level building block for generated multi-page
                  experiences.
                </p>
              </div>
            </div>
          </div>
        </OverviewGrid>
      </OverviewSection>
    )
  },
})
