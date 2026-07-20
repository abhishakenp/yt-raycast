import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

const ROW_TICKS = ['w-10', 'w-6', 'w-12', 'w-8']

/**
 * AnalyticsStats — inverted Swiss KPI band for an analytics product. A full
 * ink-inversion band (bg-foreground/text-background) that cuts in on a slanted
 * top seam, with an asymmetric 5:7 split: the left column holds a mono
 * eyebrow, the title, and the lede; the right column stacks each proof point
 * as a hairline ledger row — mono index and uppercase label on one side, a
 * giant fluid tabular numeral on the other, with a primary tick-bar motif —
 * under a giant ghost numeral watermark. Sharp, tabular, chart-adjacent
 * authority. Use to back marketing claims with concrete scale and reliability
 * figures on any analytics, BI, or data-product site. Renders fully with no
 * props via baked-in defaults.
 */
export const AnalyticsStats = defineCapsule({
  name: 'AnalyticsStats',
  description:
    'Inverted Swiss KPI band for an analytics product: a full ink-inversion band cutting in on a slanted top seam with an asymmetric 5:7 split — mono eyebrow, title, and lede left; each proof point right as a hairline ledger row with mono index, uppercase label, giant fluid tabular numeral, and a primary tick-bar motif, under a giant ghost numeral watermark. Use to back marketing claims with concrete scale and reliability figures on any analytics, BI, or data-product site.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Trusted at scale'
    const heading = props.heading ?? 'Numbers teams build on'
    const subheading =
      props.subheading ??
      "The kind of scale and reliability you only notice when it's not there."
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '1.2T+', label: 'Events tracked' },
          { value: '8,000+', label: 'Customers' },
          { value: '99.99%', label: 'Uptime SLA' },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)] sm:py-20 sm:pt-24 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <Container size="xl" className="relative px-6">
          <Watermark className="-top-6 right-0 text-[7rem] tabular-nums text-background/[0.05] sm:text-[11rem]">
            {stats[0]?.value}
          </Watermark>
          <div className="relative grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              {heading ? (
                <SectionHeading
                  align="left"
                  eyebrow={eyebrow}
                  title={heading}
                  subtitle={subheading}
                  className="gap-3"
                  eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60"
                  titleClassName="text-background text-3xl font-bold tracking-tight sm:text-4xl"
                  subtitleClassName="text-background/60 text-lg"
                />
              ) : null}
              <MonoTag
                aria-hidden="true"
                className="mt-8 hidden text-background/40 lg:block"
              >
                [ n = {String(stats.length).padStart(2, '0')} ] tabular index
              </MonoTag>
            </div>
            <div className="border-t border-background/15 lg:col-span-7">
              {stats.map((s, i) => {
                const __iv__ = s as { value: string; label: string }
                return (
                  <div
                    key={__iv__.label}
                    className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b border-background/15 py-5 sm:py-6"
                  >
                    <div className="flex flex-col gap-2">
                      <MonoTag className="tabular-nums text-background/40">
                        {String(i + 1).padStart(2, '0')}
                      </MonoTag>
                      <MonoTag className="text-background/60">
                        {__iv__.label}
                      </MonoTag>
                      <span
                        aria-hidden="true"
                        className="mt-1 flex items-center gap-1"
                      >
                        <span
                          className={cn(
                            'h-1 bg-background/70',
                            ROW_TICKS[i % ROW_TICKS.length],
                          )}
                        />
                        <span className="h-1 w-1 bg-background/30" />
                        <span className="h-1 w-1 bg-background/30" />
                      </span>
                    </div>
                    <span className="text-[clamp(2.75rem,6vw,5rem)] font-bold leading-none tabular-nums tracking-tight text-background">
                      {__iv__.value}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
