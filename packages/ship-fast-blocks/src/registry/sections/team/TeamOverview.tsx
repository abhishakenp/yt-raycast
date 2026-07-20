import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'

/**
 * TeamOverview — editorial roster hero band for a TEAM page. A mono metadata
 * rail ("· TEAM SECTION —— R—03") with a hairline rule and a tabular roster
 * index sits above an asymmetric 7:5 split, over a giant faint brand
 * watermark. On the left: a mono brand kicker, a huge black tight-tracked
 * heading and lead, a collapsed-border capabilities ledger whose open rows
 * each carry a mono tabular index numeral (01, 02, …) beside the label, and a
 * dual CTA group where the square-edged primary button carries a hard offset
 * shadow that collapses on press. On the right: a staggered portrait cluster —
 * a hairline double-framed 4:5 alt-driven photo tilted -1deg with a primary
 * offset frame behind it, a mono "01" index chip overlapping its corner, and a
 * name + mono uppercase role caption under it, plus a smaller square secondary
 * portrait tile offset and tilted the other way with its own "02" chip
 * (sm+). Below, a full-width inverted band (bg-foreground/text-background)
 * cutting in on a slanted clip-path seam holds a collapsed-border grid of
 * giant tabular stat numerals with mono uppercase labels and a small primary
 * tick motif. Tokens-only; CTAs route through section-kit route links. Use to
 * open a team / people / leadership page, or to add a focused team band to a
 * larger generated site. Renders fully with no props via baked-in defaults.
 */
export const TeamOverview = defineCapsule({
  name: 'TeamOverview',
  description:
    "Editorial roster hero band for a TEAM page: a mono metadata rail (label — hairline rule — tabular roster index) above an asymmetric 7:5 split over a giant faint brand watermark. Left: a mono brand kicker, a huge black tight-tracked heading and lead, a collapsed-border capabilities ledger of open rows each with a mono tabular index numeral (01, 02, …) beside the label, and a dual CTA group whose square-edged primary button carries a hard offset shadow that collapses on press. Right: a staggered portrait cluster — a hairline double-framed 4:5 alt-driven photo tilted -1deg with a primary offset frame behind, a mono '01' index chip on its corner, and a name + mono uppercase role caption, plus a smaller square secondary portrait tile offset and tilted the other way with an '02' chip. Below, a full-width inverted band cutting in on a slanted clip-path seam holds a collapsed-border grid of giant tabular stat numerals with mono uppercase labels and a small primary tick motif. Tokens-only; CTAs route through section-kit route links. Use to open a team / people / leadership page or add a focused team band to a generated site.",
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
    const brand = props.brand ?? 'Team'
    const eyebrow = props.eyebrow ?? 'Team section'
    const heading = props.heading ?? 'Team experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Team page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Meet the team'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Team website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built team layout',
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

    // Defensive shaping so malformed generated collections never crash render.
    const rawFeatures: unknown[] = Array.isArray(features) ? features : []
    const featureRows = rawFeatures.filter(
      (feature): feature is string =>
        typeof feature === 'string' && feature.length > 0,
    )
    const rawStats: unknown[] = Array.isArray(stats) ? stats : []
    const statRows = rawStats
      .filter(
        (stat): stat is Record<string, unknown> =>
          !!stat && typeof stat === 'object',
      )
      .map((stat) => ({
        value: String(stat.value ?? ''),
        label: String(stat.label ?? ''),
      }))

    const rosterIndex = String(featureRows.length).padStart(2, '0')

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        {/* Giant faint brand watermark behind the editorial split. */}
        <Watermark className="-right-6 top-16 text-[9rem] sm:text-[13rem] lg:text-[16rem]">
          {brand}
        </Watermark>

        <Container className="relative">
          {/* Mono metadata rail: label — hairline rule — roster index. */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 bg-primary"
              />
              <MonoTag>{eyebrow}</MonoTag>
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag className="tabular-nums" tone="faint">
              R—{rosterIndex}
            </MonoTag>
          </div>

          {/* Asymmetric 7:5 editorial split. */}
          <div className="mt-10 grid items-start gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-10">
            {/* Content column. */}
            <div className="flex flex-col lg:col-span-7">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                {brand}
              </p>
              <h2 className="mt-4 max-w-2xl text-balance text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground sm:text-5xl lg:text-6xl">
                {heading}
              </h2>
              <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>

              {featureRows.length ? (
                <ul className="mt-9 border-t border-border">
                  {featureRows.map((feature, i) => (
                    <li
                      key={feature}
                      className="flex items-baseline gap-5 border-b border-border py-3.5"
                    >
                      <span
                        aria-hidden="true"
                        className="font-mono text-xs tabular-nums text-muted-foreground/70"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-base font-medium tracking-tight text-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground/20 transition-all duration-150 hover:bg-primary/90 active:translate-x-px active:translate-y-px active:shadow-none"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none border border-foreground/20 bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all duration-150 hover:bg-muted active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
            </div>

            {/* Staggered portrait cluster. */}
            <div className="relative pb-14 pl-6 sm:pb-16 sm:pl-10 lg:col-span-5">
              <div className="relative -rotate-1">
                {/* Primary offset frame behind the main portrait. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-primary/30 bg-primary/5"
                />
                <div className="relative overflow-hidden rounded-none border border-foreground/15 bg-muted">
                  <Image
                    alt={imageAlt}
                    w={900}
                    h={1120}
                    loading="lazy"
                    className="aspect-[4/5] size-full object-cover"
                  />
                  <div className="border-t border-foreground/15 bg-background px-5 py-4 text-left sm:text-right">
                    <p className="text-sm font-semibold tracking-tight text-foreground">
                      {brand}
                    </p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {eyebrow}
                    </p>
                  </div>
                </div>
                <span className="absolute -left-3 -top-3 inline-flex rotate-1 items-center rounded-none border border-foreground bg-background px-3 py-1.5 font-mono text-[11px] font-semibold tabular-nums text-foreground shadow-[3px_3px_0_0] shadow-primary/30">
                  01
                </span>
              </div>

              {/* Secondary staggered portrait tile. */}
              <div
                aria-hidden="true"
                className="absolute -bottom-2 left-0 hidden w-32 rotate-2 overflow-hidden rounded-none border border-foreground/15 bg-muted shadow-[4px_4px_0_0] shadow-foreground/10 sm:block lg:-left-4"
              >
                <Image
                  alt={imageAlt}
                  w={320}
                  h={320}
                  loading="lazy"
                  className="aspect-square size-full object-cover"
                />
                <span className="absolute left-1.5 top-1.5 inline-flex items-center rounded-none border border-foreground bg-background px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-foreground">
                  02
                </span>
              </div>
            </div>
          </div>

          {/* Inverted stats band cutting in on a slanted seam. */}
          {statRows.length ? (
            <div className="relative mt-16 -mx-4 bg-foreground px-4 pb-1 pt-14 text-background [clip-path:polygon(0_2rem,100%_0,100%_100%,0_100%)] sm:-mx-6 sm:mt-20 sm:px-6 sm:pt-16 lg:-mx-8 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                  <span className="flex items-center gap-3">
                    <span aria-hidden="true" className="size-2 bg-primary" />
                    By the numbers
                  </span>
                  <span className="tabular-nums">
                    {String(statRows.length).padStart(2, '0')} metrics
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-0 border-l border-t border-background/15 sm:grid-cols-3">
                  {statRows.map((stat, i) => (
                    <div
                      key={`${stat.label}-${i}`}
                      className="flex flex-col gap-3 border-b border-r border-background/15 p-5 sm:p-8"
                    >
                      <span className="font-mono text-[11px] tabular-nums text-background/40">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-none tracking-tight tabular-nums text-background">
                        {stat.value}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
                        {stat.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="mt-1 flex items-center gap-1"
                      >
                        <span className="h-1 w-8 bg-primary" />
                        <span className="h-1 w-1 bg-background/30" />
                        <span className="h-1 w-1 bg-background/30" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    )
  },
})
