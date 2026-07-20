import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { KpiTrendArrow } from '#/section-kit/KpisGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/** Deterministic per-cell div-built sparkline heights. */
const SPARKS = [
  ['h-2', 'h-4', 'h-3', 'h-5', 'h-4', 'h-6', 'h-5', 'h-7', 'h-6', 'h-8'],
  ['h-3', 'h-2', 'h-4', 'h-5', 'h-3', 'h-6', 'h-7', 'h-5', 'h-8', 'h-7'],
  ['h-2', 'h-3', 'h-5', 'h-4', 'h-6', 'h-5', 'h-7', 'h-8', 'h-6', 'h-8'],
  ['h-6', 'h-7', 'h-5', 'h-6', 'h-4', 'h-5', 'h-3', 'h-4', 'h-3', 'h-2'],
]

/**
 * AnalyticsKpis — Swiss data-grid KPI summary strip for a SaaS analytics
 * dashboard. A collapsed-border hairline grid (2-up on mobile, 4-up on
 * desktop) of sharp metric cells: each carries a mono uppercase label with a
 * tabular index, a large tabular-numeral value, an up/down trend delta
 * (positive uses chart styling, negative destructive) with a directional
 * arrow, a mono caption, and a div-built sparkline motif whose final bar
 * echoes the trend color. Tokens-only, no links, no icon chips — hairline
 * precision instead of card chrome. Use as the top summary row of a dashboard
 * — total revenue, active users, conversion rate, average session, or any
 * headline-metric scorecard band. Renders fully with no props via four
 * baked-in default KPIs.
 */
export const AnalyticsKpis = defineCapsule({
  name: 'AnalyticsKpis',
  description:
    'Swiss data-grid KPI summary strip for a SaaS analytics dashboard: a collapsed-border hairline grid (2-up mobile, 4-up desktop) of sharp metric cells, each with a mono uppercase label and tabular index, a large tabular-numeral value, an up/down trend delta (positive chart styling, negative destructive) with a directional arrow, a mono caption, and a div-built sparkline whose final bar echoes the trend color. Tokens-only, no links. Use as the top summary row of a dashboard — total revenue, active users, conversion rate, average session, or any headline-metric scorecard band.',
  props: z.object({
    /** KPI metric cards. `trend` "up" renders positive (chart) styling, "down" negative. */
    kpis: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          delta: z.string(),
          trend: z.enum(['up', 'down']),
          caption: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const kpis = props.kpis?.length
      ? props.kpis
      : ([
          {
            label: 'Total Revenue',
            value: '$124,592',
            delta: '+12.5%',
            trend: 'up',
            caption: 'vs last month',
          },
          {
            label: 'Active Users',
            value: '8,429',
            delta: '+8.2%',
            trend: 'up',
            caption: 'vs last month',
          },
          {
            label: 'Conversion Rate',
            value: '3.24%',
            delta: '+2.1%',
            trend: 'up',
            caption: 'vs last month',
          },
          {
            label: 'Avg. Session',
            value: '4m 32s',
            delta: '-1.4%',
            trend: 'down',
            caption: 'vs last month',
          },
        ] as const)

    return (
      <section
        aria-label="Key performance indicators"
        className={cn('bg-background py-16 lg:py-24', props.className)}
      >
        <Container size="xl">
          <div className="grid grid-cols-2 border-l border-t border-border lg:grid-cols-4">
            {kpis.map((kpi, i) => {
              const up = kpi.trend === 'up'
              const bars = SPARKS[i % SPARKS.length]
              return (
                <div
                  key={kpi.label}
                  className="group flex flex-col border-b border-r border-border p-4 transition-colors duration-150 hover:bg-muted/30 sm:p-6"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <MonoTag className="text-[10px]">{kpi.label}</MonoTag>
                    <MonoTag
                      aria-hidden="true"
                      tone="faint"
                      className="tabular-nums"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                  </div>
                  <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                    {kpi.value}
                  </p>
                  <div
                    className={cn(
                      'mt-2 flex items-center gap-1.5',
                      up ? 'text-chart-1' : 'text-destructive',
                    )}
                  >
                    <KpiTrendArrow trend={up ? 'up' : 'down'} size={14} />
                    <span className="font-mono text-xs font-semibold tabular-nums">
                      {kpi.delta}
                    </span>
                  </div>
                  <MonoTag tone="faint" className="mt-1 text-[10px]">
                    {kpi.caption}
                  </MonoTag>
                  <span
                    aria-hidden="true"
                    className="mt-auto flex items-end gap-px pt-5"
                  >
                    {bars.map((h, j) => (
                      <span
                        key={j}
                        className={cn(
                          'w-full',
                          h,
                          j === bars.length - 1
                            ? up
                              ? 'bg-chart-1'
                              : 'bg-destructive'
                            : 'bg-foreground/15',
                        )}
                      />
                    ))}
                  </span>
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
