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
 * ShopOverview — editorial-commerce overview band for the Shop page family.
 * An asymmetric 6:4 split behind a giant ghost brand watermark: a mono eyebrow
 * (primary tick), a small uppercase brand line, an oversized extrabold
 * tight-tracked heading, supporting copy, a mono slash-separated feature ticker,
 * square CTAs (ink-filled primary + hairline outline secondary, both with press
 * feedback), and a collapsed-border ledger whose values read as oversized
 * tabular price numerals. Beside it, a staggered image plate — a slanted,
 * inverted bg-foreground backing plate peeks from behind a hairline hard-framed
 * panel rendered through the alt-driven Image component. Use when composing a
 * shop page or adding a focused shop band to a larger generated site.
 */
export const ShopOverview = defineCapsule({
  name: 'ShopOverview',
  description:
    'Editorial-commerce overview band for the Shop page family: an asymmetric split behind a giant ghost brand watermark, with a mono eyebrow, small uppercase brand line, oversized extrabold tight-tracked heading, supporting copy, a mono slash-separated feature ticker, square CTAs with press feedback, and a collapsed-border ledger of oversized tabular price numerals, beside a staggered image plate whose slanted inverted backing plate peeks from behind a hairline hard-framed panel rendered through the alt-driven Image component. Use when composing a shop page or adding a focused shop band to a larger generated site.',
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
    const brand = props.brand ?? 'Shop'
    const eyebrow = props.eyebrow ?? 'Shop section'
    const heading = props.heading ?? 'Shop experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Shop page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Shop website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built shop layout',
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
        <Watermark className="-right-6 top-2 text-[28vw] leading-none sm:text-[18rem]">
          {brand}
        </Watermark>
        <OverviewGrid className="relative lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <OverviewContent>
            <OverviewEyebrow className="mb-6 inline-flex items-center gap-2 self-start rounded-none border-0 bg-transparent p-0 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="max-w-3xl text-[2.75rem] font-extrabold leading-[0.95] tracking-tighter sm:text-6xl">
              {heading}
            </OverviewHeading>
            <OverviewSubheading className="mt-6 max-w-2xl text-lg leading-relaxed">
              {subheading}
            </OverviewSubheading>
            <OverviewFeatures className="mt-8 items-center gap-x-3 gap-y-2">
              {features.map((feature: string, index: number) => (
                <OverviewFeature
                  key={feature}
                  className="inline-flex items-center gap-3 rounded-none border-0 bg-transparent p-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {index > 0 ? (
                    <span aria-hidden="true" className="text-border">
                      /
                    </span>
                  ) : null}
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta className="mt-10 grid grid-cols-2 gap-3 sm:flex">
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-foreground px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border border-foreground/25 bg-transparent px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-150 hover:border-foreground active:translate-y-px"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="mt-14 grid-cols-3 gap-0 border-l border-t border-border pt-0">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="border-b border-r border-border p-4 sm:p-5"
                >
                  <OverviewStatValue className="text-3xl font-extrabold leading-none tracking-tighter tabular-nums sm:text-5xl lg:text-6xl">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em]">
                    {stat.label}
                  </OverviewStatLabel>
                </OverviewStat>
              ))}
            </OverviewStats>
          </OverviewContent>
          <div className="relative pb-4 pl-4 lg:pb-6 lg:pl-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-4 translate-y-4 bg-foreground [clip-path:polygon(0_1.75rem,100%_0,100%_100%,0_100%)] lg:-translate-x-6 lg:translate-y-6"
            />
            <OverviewMediaPanel
              alt={imageAlt}
              brand={brand}
              caption="Section-level building block for generated multi-page experiences."
              className="relative [&>div:first-child]:hidden [&>div:last-child]:rounded-none [&>div:last-child]:border-2 [&>div:last-child]:border-foreground [&>div:last-child]:shadow-none"
            />
          </div>
        </OverviewGrid>
      </OverviewSection>
    )
  },
})
