import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { GraphPaper, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/** Deterministic div-built sparkline heights (Swiss chart motif, no JS). */
const SPARK_HEIGHTS = [
  'h-3',
  'h-5',
  'h-4',
  'h-7',
  'h-6',
  'h-9',
  'h-5',
  'h-8',
  'h-10',
  'h-7',
  'h-11',
  'h-9',
  'h-12',
  'h-8',
  'h-10',
  'h-12',
  'h-9',
  'h-11',
  'h-12',
  'h-10',
]

const STAT_TICKS = ['w-8', 'w-5', 'w-10']

/**
 * AnalyticsHero — Swiss data-grid split hero for an analytics product landing
 * page. An asymmetric 7:5 grid divided by a hairline center rule over faint
 * graph paper: the left column stacks a hairline-framed pulsing status tag, a
 * giant tight-leading display headline with the key phrase in primary, a
 * supporting paragraph, dual sharp-cornered CTAs with press feedback
 * (filled-primary "Start Free Trial" + hairline "Book a demo"), and a
 * collapsed-border three-cell proof strip with tabular numerals and tick-bar
 * motifs; the right column frames a dashboard screenshot in a hairline panel
 * with a mono chrome row, a div-built sparkline band, and tabular axis labels,
 * backed by a giant ghost numeral watermark. CTAs write to shared Lakebed
 * conversion state. Use as the opening hero for analytics, BI, dashboards,
 * product metrics, or data-product sites. Renders fully with no props.
 */
export const AnalyticsHero = defineCapsule({
  name: 'AnalyticsHero',
  description:
    "Swiss data-grid split hero for an analytics product landing page: an asymmetric 7:5 grid divided by a hairline rule over faint graph paper. Left column stacks a hairline-framed pulsing status tag, giant tight display headline with the key phrase in primary, supporting paragraph, dual sharp fullstack CTAs with press feedback (filled-primary 'Start Free Trial' + hairline 'Book a demo'), and a collapsed-border three-cell proof strip with tabular numerals and tick bars; right column frames a dashboard screenshot in a hairline panel with a mono chrome row, a div-built sparkline band, and tabular axis labels under a giant ghost numeral watermark. CTAs write to shared Lakebed conversion state. Use as the opening hero for analytics, BI, dashboards, product metrics, or data-product sites.",
  props: z.object({
    /** Eyebrow status / announcement pill text. */
    eyebrow: z.string().optional(),
    /** Headline text before the highlighted phrase. */
    heading: z.string().optional(),
    /** Phrase inside the heading rendered in the primary highlight color. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary filled CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary outlined CTA label. */
    secondaryCta: z.string().optional(),
    /** Proof stats shown in the strip under the CTAs. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Real-time product analytics'
    const heading = props.heading ?? 'Turn raw events into'
    const highlight = props.highlight ?? 'decisions you can ship'
    const subheading =
      props.subheading ??
      'Pulse unifies every event, funnel, and cohort into one fast, queryable view — so your team stops guessing and starts shipping with confidence.'
    const primaryCta = props.primaryCta ?? 'Start Free Trial'
    const secondaryCta = props.secondaryCta ?? 'Book a demo'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '12B+', label: 'Events / day' },
          { value: '50ms', label: 'Query latency' },
          { value: '99.99%', label: 'Uptime' },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
      >
        <GraphPaper className="inset-y-0 right-0 hidden w-[45%] lg:block" />
        <Container size="xl" className="relative px-6">
          <div className="grid gap-14 py-14 sm:py-16 lg:grid-cols-12 lg:gap-0 lg:py-24">
            <div className="lg:col-span-7 lg:border-r lg:border-border lg:pr-14">
              <span className="inline-flex items-center gap-2.5 border border-border px-3 py-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block size-1.5 animate-pulse bg-primary"
                />
                <MonoTag>{eyebrow}</MonoTag>
              </span>
              <h1 className="mt-7 text-[clamp(2.625rem,5.5vw,4.75rem)] font-bold leading-[0.98] tracking-tight text-foreground">
                {heading} <span className="text-primary">{highlight}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={primaryCta}
                  plan={primaryCta}
                  source="hero"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Starting
                    </>
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                </SaasPlanActionButton>
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={secondaryCta}
                  plan={secondaryCta}
                  source="hero"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Opening
                    </>
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-border bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-[border-color,background-color,transform] duration-150 hover:border-foreground/40 hover:bg-muted/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                  {secondaryCta}
                </SaasPlanActionButton>
              </div>
              <dl className="mt-12 grid grid-cols-3 border-l border-t border-border">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className="border-b border-r border-border p-4 sm:p-5"
                  >
                    <dt className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
                      {s.value}
                    </dt>
                    <dd className="mt-1.5">
                      <MonoTag className="block text-[10px]">{s.label}</MonoTag>
                    </dd>
                    <span
                      aria-hidden="true"
                      className="mt-3 flex items-center gap-1"
                    >
                      <span
                        className={cn(
                          'h-1 bg-primary',
                          STAT_TICKS[i % STAT_TICKS.length],
                        )}
                      />
                      <span className="h-1 w-1 bg-border" />
                      <span className="h-1 w-1 bg-border" />
                    </span>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative lg:col-span-5 lg:pl-14">
              <Watermark className="-top-12 right-0 text-[6rem] tabular-nums sm:text-[8rem] lg:-top-6">
                {stats[0]?.value}
              </Watermark>
              <div className="relative border border-border bg-card">
                <div
                  className="flex items-center justify-between border-b border-border px-4 py-3"
                  aria-hidden="true"
                >
                  <span className="flex items-center gap-2">
                    <span className="size-1.5 bg-primary" />
                    <MonoTag className="text-[10px]">Live dashboard</MonoTag>
                  </span>
                  <span className="flex gap-1">
                    <span className="size-1.5 bg-muted-foreground/30" />
                    <span className="size-1.5 bg-muted-foreground/30" />
                    <span className="size-1.5 bg-muted-foreground/30" />
                  </span>
                </div>
                <Image
                  alt="analytics dashboard screenshot charts"
                  w={1120}
                  h={760}
                  className="block aspect-[3/2] w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="flex h-16 items-end gap-px border-t border-border px-4 pt-3"
                >
                  {SPARK_HEIGHTS.map((h, i) => (
                    <span
                      key={i}
                      className={cn(
                        'w-full',
                        h,
                        i === SPARK_HEIGHTS.length - 1
                          ? 'bg-primary'
                          : 'bg-foreground/15',
                      )}
                    />
                  ))}
                </div>
                <div
                  aria-hidden="true"
                  className="flex items-center justify-between px-4 pb-3 pt-2 font-mono text-[10px] tabular-nums text-muted-foreground/60"
                >
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
