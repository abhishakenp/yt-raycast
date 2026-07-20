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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * VideoStreamingOverview — dark-cinematic overview / hero band for the Video
 * Streaming page family. An asymmetric 7:5 split pairs a left text column (mono
 * square eyebrow + brand slate, a giant extrabold heading, supporting copy,
 * square mono feature chips, dual square press-responsive CTAs, and a
 * collapsed-border tabular KPI ledger) with a right letterboxed media panel —
 * a 16:9 still framed by thin bg-foreground bars top and bottom with corner
 * mono timecode slates and a soft bottom-up gradient, rendered through the
 * alt-driven Image component. Tokens-only so the treatment flips between light
 * and dark themes. Use when composing a video streaming page or adding a focused
 * video streaming band to a larger generated site.
 */
export const VideoStreamingOverview = defineCapsule({
  name: 'VideoStreamingOverview',
  description:
    'Dark-cinematic overview / hero band for the Video Streaming page family. An asymmetric 7:5 split pairs a left text column (mono square eyebrow + brand slate, a giant extrabold heading, supporting copy, square mono feature chips, dual square press-responsive CTAs, and a collapsed-border tabular KPI ledger) with a right letterboxed media panel — a 16:9 still framed by thin bg-foreground bars and corner mono timecode slates, rendered through the alt-driven Image component. Tokens-only and theme-adaptive. Use when composing a video streaming page or adding a focused video streaming band to a larger generated site.',
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
    const brand = props.brand ?? 'Video Streaming'
    const eyebrow = props.eyebrow ?? 'Video Streaming section'
    const heading =
      props.heading ?? 'Video Streaming experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Video Streaming page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Video Streaming website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built video streaming layout',
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
        <OverviewGrid className="lg:grid-cols-[7fr_5fr]">
          <OverviewContent>
            <OverviewEyebrow className="mb-6 w-fit rounded-none border-border bg-muted/60 font-mono text-[11px] uppercase tracking-[0.2em]">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="font-mono text-[11px] uppercase tracking-[0.2em]">
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
                  className="rounded-none border-border font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 hover:bg-primary/90 active:translate-y-px motion-reduce:transform-none"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="grid-cols-3 gap-0 border-l border-t border-border pt-0">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="border-b border-r border-border p-4"
                >
                  <OverviewStatValue className="text-3xl font-extrabold tabular-nums tracking-tight">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em]">
                    {stat.label}
                  </OverviewStatLabel>
                </OverviewStat>
              ))}
            </OverviewStats>
          </OverviewContent>

          <div className="relative bg-foreground py-5">
            <span className="absolute left-4 top-8 z-10 font-mono text-[11px] uppercase tracking-[0.2em] text-background/70">
              SC. 01
            </span>
            <span className="absolute bottom-8 right-4 z-10 font-mono text-[11px] uppercase tracking-[0.2em] text-background/70">
              Runtime 02:14
            </span>
            <div className="relative aspect-video overflow-hidden">
              <Image
                alt={imageAlt}
                w={900}
                h={506}
                className="size-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent"
              />
            </div>
          </div>
        </OverviewGrid>
      </OverviewSection>
    )
  },
})
