import { defineCapsule } from '#/capsules/openui.ts'
import { useState } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import { DashboardChart } from '#/section-kit/DashboardChart.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * DashboardChartActivity — Swiss-data analytics band for a SaaS admin
 * dashboard: an asymmetric 8:4 collapsed-border split sharing one hairline
 * frame. On the left a revenue panel with a title/subtitle header, a
 * square-edged mono segmented range toggle (active = ink inversion), and a
 * div-built token bar chart — hairline gridlines with mono tabular axis
 * values, a ghost tabular numeral of the latest reading behind the bars, the
 * current-period bar in primary — over a mono axis-label strip. On the right
 * a recent-activity ledger: hairline-divided rows, each with a small square
 * tone marker (data-viz tokens), a sentence with an optional bolded phrase,
 * and a mono uppercase timestamp; a mono "View all" link routes through
 * section-kit route links. The range toggles are interactive. Use below the
 * KPI row to pair a trend chart with a live activity stream. Renders fully
 * with no props via baked-in revenue + activity defaults.
 */
export const DashboardChartActivity = defineCapsule({
  name: 'DashboardChartActivity',
  description:
    'Swiss-data analytics band for a SaaS admin dashboard: an asymmetric 8:4 collapsed-border split in one hairline frame. Left, a revenue panel with title/subtitle, a square mono segmented range toggle (active = ink inversion) and a div-built token bar chart — hairline gridlines with mono tabular axis values, a ghost tabular numeral of the latest reading, current-period bar in primary — over a mono axis-label strip. Right, a recent-activity ledger of hairline-divided rows with square tone markers (data-viz tokens), sentences with optional bold phrases and mono uppercase timestamps, plus a mono "View all" link that routes through section-kit route links. Range toggles are interactive. Use below the KPI row to pair a trend chart with a live activity stream.',
  props: z.object({
    /** Revenue chart panel: titles, range toggles and the plotted series. */
    chart: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        /** Range-toggle button labels; the first is active. */
        ranges: z.array(z.string()).optional(),
        /** X-axis category labels (one per data point). */
        labels: z.array(z.string()).optional(),
        /** Numeric series plotted as the area line. */
        data: z.array(z.number()).optional(),
      })
      .optional(),
    /** Recent-activity feed. `tone` colors the icon tile + chooses the glyph. */
    activity: z
      .object({
        title: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              text: z.string(),
              /** Phrase inside `text` rendered bold (matched verbatim). */
              emphasis: z.string().optional(),
              time: z.string(),
              tone: z
                .enum(['emerald', 'sky', 'orange', 'primary', 'violet'])
                .optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const chartTitle = props.chart?.title ?? 'Revenue Overview'
    const chartSubtitle = props.chart?.subtitle ?? 'Monthly revenue performance'
    const chartRanges = props.chart?.ranges?.length
      ? props.chart.ranges
      : ['12 Months', '30 Days']
    const chartLabels = props.chart?.labels?.length
      ? props.chart.labels
      : [
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
        ]
    const chartData = props.chart?.data?.length
      ? props.chart.data
      : [
          28000, 32000, 30500, 35000, 38000, 36000, 42000, 41000, 44000, 47000,
          46000, 48294,
        ]

    const activityTitle = props.activity?.title ?? 'Recent Activity'
    const activityViewAll = props.activity?.viewAll ?? 'View all'
    const activityItems = props.activity?.items?.length
      ? props.activity.items
      : [
          {
            text: 'Order #4921 completed',
            emphasis: 'Order #4921',
            time: '2 minutes ago',
            tone: 'emerald' as const,
          },
          {
            text: 'New customer Sarah Chen',
            emphasis: 'Sarah Chen',
            time: '15 minutes ago',
            tone: 'sky' as const,
          },
          {
            text: 'Low stock: Wireless Headphones',
            emphasis: 'Wireless Headphones',
            time: '32 minutes ago',
            tone: 'orange' as const,
          },
          {
            text: 'New review from James Wilson',
            emphasis: 'James Wilson',
            time: '1 hour ago',
            tone: 'primary' as const,
          },
          {
            text: 'Order #4918 shipped',
            emphasis: 'Order #4918',
            time: '2 hours ago',
            tone: 'violet' as const,
          },
        ]

    const [activeRange, setActiveRange] = useState(chartRanges[0])

    // ── Activity ledger markers (square, data-viz tokens). ──
    const activityTones: Record<string, string> = {
      emerald: 'bg-chart-1',
      sky: 'bg-chart-2',
      orange: 'bg-chart-3',
      primary: 'bg-primary',
      violet: 'bg-chart-5',
    }

    // ── Div-built bar chart scale. ──
    const maxVal = Math.max(...chartData)
    const latest = chartData[chartData.length - 1]
    const axisSteps = [1, 0.75, 0.5, 0.25]
    const formatValue = (v: number) => Math.round(v).toLocaleString('en-US')

    return (
      <section className={cn('bg-background py-10 sm:py-14', props.className)}>
        <Container>
          <ResponsiveGrid
            cols="1-lg-3"
            className="grid-cols-1 gap-0 border border-border lg:grid-cols-12"
          >
            {/* Revenue chart panel */}
            <DashboardChart className="rounded-none border-0 bg-card p-0 lg:col-span-8">
              <Card className="rounded-none border-0 bg-transparent p-0">
                <div className="flex flex-col justify-between gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:p-5">
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">
                      {chartTitle}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {chartSubtitle}
                    </p>
                  </div>
                  <div className="flex divide-x divide-border self-start border border-border sm:self-auto">
                    {chartRanges.map((range) => {
                      const active = activeRange === range
                      return (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setActiveRange(range)}
                          className={cn(
                            'px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-150 active:translate-y-px',
                            active
                              ? 'bg-foreground text-background'
                              : 'bg-card text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {range}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div
                    role="img"
                    aria-label={`${chartTitle} chart`}
                    className="relative h-56"
                  >
                    {/* Hairline gridlines + mono axis values */}
                    {axisSteps.map((t) => (
                      <div
                        key={t}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 border-t border-border/70"
                        style={{ top: `${(1 - t) * 100}%` }}
                      >
                        <span className="absolute right-0 top-0 hidden -translate-y-full font-mono text-[9px] tabular-nums text-muted-foreground/60 sm:inline">
                          {formatValue(maxVal * t)}
                        </span>
                      </div>
                    ))}
                    <Watermark className="left-0 top-2 text-[3rem] tabular-nums sm:text-[4.5rem]">
                      {formatValue(latest)}
                    </Watermark>
                    {/* Token bar series — current period in primary */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 flex items-end gap-[3px] sm:gap-1.5"
                    >
                      {chartData.map((v, i) => (
                        <span
                          key={i}
                          className={cn(
                            'min-w-0 flex-1 transition-colors duration-150',
                            i === chartData.length - 1
                              ? 'bg-primary'
                              : 'bg-foreground/[0.14] hover:bg-foreground/30',
                          )}
                          style={{
                            height: `${maxVal > 0 ? Math.max((v / maxVal) * 100, 3) : 3}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {chartLabels.map((label, i) => (
                      <span
                        key={label}
                        className={cn(i % 2 === 1 && 'hidden sm:inline')}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </DashboardChart>

            {/* Recent activity ledger */}
            <Card className="rounded-none border-0 border-t border-border bg-card p-0 lg:col-span-4 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between border-b border-border p-4 sm:p-5">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  {activityTitle}
                </h2>
                <NavbarRouteLink
                  className="font-mono text-[11px] uppercase tracking-[0.08em] text-primary transition-colors duration-150 hover:text-primary/80 active:translate-y-px"
                  href={activityViewAll}
                >
                  {activityViewAll}
                </NavbarRouteLink>
              </div>
              <div className="divide-y divide-border">
                {activityItems.map((item, i) => {
                  const marker = activityTones[item.tone ?? 'primary']
                  const emph = item.emphasis
                  let before = item.text
                  let bold = ''
                  let after = ''
                  if (emph && item.text.includes(emph)) {
                    const idx = item.text.indexOf(emph)
                    before = item.text.slice(0, idx)
                    bold = emph
                    after = item.text.slice(idx + emph.length)
                  }
                  return (
                    <div key={i} className="flex gap-3 px-4 py-3 sm:px-5">
                      <span
                        aria-hidden="true"
                        className={cn('mt-1.5 size-1.5 shrink-0', marker)}
                      />
                      <div className="min-w-0">
                        <p className="text-sm leading-snug text-foreground">
                          {before}
                          {bold ? (
                            <span className="font-semibold">{bold}</span>
                          ) : null}
                          {after}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tabular-nums tracking-[0.08em] text-muted-foreground">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
