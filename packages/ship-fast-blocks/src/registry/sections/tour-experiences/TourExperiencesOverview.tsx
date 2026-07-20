import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { OverviewSection } from '#/section-kit/OverviewSection.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * TourExperiencesOverview — editorial-wanderlust overview band for the Tour
 * Experiences page family. A mono metadata rail (index · brand — hairline rule)
 * above a giant tight-tracked heading and lede, then an asymmetric 7:5 split:
 * narrative copy with rotated mono stamp feature chips and a collapsed-border
 * KPI ledger on the left, and an alt-driven full-bleed photo plate — sharp
 * corners, hard offset frame, rotated museum-label caption chip — on the right.
 * Dual CTAs route through section-kit route links. Use when composing a tour
 * experiences page or adding a focused tour experiences band to a larger
 * generated site.
 */
export const TourExperiencesOverview = defineCapsule({
  name: 'TourExperiencesOverview',
  description:
    'Editorial-wanderlust overview band for the Tour Experiences page family: a mono metadata rail (index · brand) above a giant tight-tracked heading and lede, then an asymmetric 7:5 split with narrative copy, rotated mono stamp feature chips, and a collapsed-border KPI ledger on the left and an alt-driven full-bleed photo plate (sharp corners, hard offset frame, rotated museum-label caption) on the right, plus dual CTAs that route through section-kit route links. Use when composing a tour experiences page or adding a focused tour experiences band to a larger generated site.',
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
    const brand = props.brand ?? 'Tour Experiences'
    const eyebrow = props.eyebrow ?? 'Tour Experiences section'
    const heading =
      props.heading ?? 'Tour Experiences experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Tour Experiences page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Tour Experiences website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built tour experiences layout',
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
        {/* Giant ghost brand watermark. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-10 select-none whitespace-nowrap font-extrabold leading-none tracking-tighter text-foreground/[0.035] text-[9rem] sm:text-[13rem]"
        >
          {brand}
        </span>

        <Container size="xl" className="relative">
          {/* Mono metadata rail. */}
          <div className="flex items-center gap-4">
            <MonoTag className="flex items-center gap-2 tracking-[0.18em]">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              {eyebrow}
            </MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" aria-hidden="true">
              {brand}
            </MonoTag>
          </div>

          <div className="mt-8 max-w-3xl">
            <h2 className="text-4xl font-extrabold leading-[0.98] tracking-tighter text-foreground sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {subheading}
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-14">
            {/* Left: narrative, feature stamps, KPI ledger, CTAs. */}
            <div className="lg:col-span-7">
              <div className="flex flex-wrap gap-2.5">
                {features.map((feature: string, i) => (
                  <span
                    key={feature}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-none border border-border px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground',
                      i % 2 === 0 ? '-rotate-1' : 'rotate-1',
                    )}
                  >
                    <span aria-hidden="true" className="size-1.5 bg-primary" />
                    {feature}
                  </span>
                ))}
              </div>

              <dl className="mt-10 grid grid-cols-1 border-l border-t border-border sm:grid-cols-3">
                {stats.map((stat: { value: string; label: string }) => (
                  <div
                    key={stat.label}
                    className="border-b border-r border-border px-5 py-5"
                  >
                    <dt className="text-3xl font-extrabold leading-none tracking-tight tabular-nums text-foreground">
                      {stat.value}
                    </dt>
                    <dd className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-[5px_5px_0_0] shadow-primary transition-[transform,box-shadow] duration-150 hover:bg-foreground/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
            </div>

            {/* Right: full-bleed photo plate with hard offset frame + caption. */}
            <div className="relative -rotate-1 lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-primary/40 bg-primary/5"
              />
              <div className="relative overflow-hidden rounded-none border border-foreground/20">
                <Image
                  alt={imageAlt}
                  w={900}
                  h={700}
                  loading="lazy"
                  className="aspect-[4/3] size-full object-cover"
                />
              </div>
              <span className="absolute -bottom-3 -left-3 inline-flex rotate-2 items-center gap-2 rounded-none border border-foreground bg-background px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-[4px_4px_0_0] shadow-primary/30">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                {brand}
              </span>
            </div>
          </div>
        </Container>
      </OverviewSection>
    )
  },
})
