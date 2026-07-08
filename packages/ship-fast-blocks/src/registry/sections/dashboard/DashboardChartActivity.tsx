import { defineCapsule } from '#/capsules/openui.ts'
import { useState, type ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * DashboardChartActivity — a two-column analytics band for a SaaS admin
 * dashboard. On the left (2/3 width) a revenue panel with a title/subtitle,
 * range-toggle buttons and a smooth inline SVG area chart (indigo gradient fill,
 * horizontal gridlines, an end-point marker and an axis-label strip). On the
 * right a recent-activity feed card with a "View all" link and a list of items,
 * each a tone-tinted round icon + a sentence (with an optional bolded phrase) +
 * a relative timestamp. The range toggles are interactive; "View all" routes
 * through useNavigate. Use below the KPI row to pair a trend chart with a live
 * activity stream. Renders fully with no props via baked-in revenue + activity
 * defaults.
 */
export const DashboardChartActivity = defineCapsule({
  name: 'DashboardChartActivity',
  description:
    "A two-column analytics band for a SaaS admin dashboard: on the left (2/3 width) a revenue panel with title/subtitle, range-toggle buttons and a smooth inline SVG area chart (indigo gradient fill, gridlines, end-point marker, axis-label strip); on the right a recent-activity feed card with a 'View all' link and tone-tinted round-icon items (sentence + optional bold phrase + timestamp). Range toggles are interactive; 'View all' routes through useNavigate. Use below the KPI row to pair a trend chart with a live activity stream.",
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
    const go = useNavigate()

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

    // ── Activity feed tints + glyphs. ──
    const activityTones: Record<string, { wrap: string; icon: ReactNode }> = {
      emerald: {
        wrap: 'bg-chart-1/10 text-chart-1',
        icon: (
          <>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </>
        ),
      },
      sky: {
        wrap: 'bg-chart-2/10 text-chart-2',
        icon: (
          <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </>
        ),
      },
      orange: {
        wrap: 'bg-chart-3/10 text-chart-3',
        icon: (
          <>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </>
        ),
      },
      primary: {
        wrap: 'bg-primary/10 text-primary',
        icon: (
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        ),
      },
      violet: {
        wrap: 'bg-chart-5/10 text-chart-5',
        icon: (
          <>
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </>
        ),
      },
    }

    // ── Build a smooth area-chart path (Catmull-Rom → cubic Bézier). ──
    const chartW = 640
    const chartH = 240
    const padX = 8
    const padTop = 12
    const padBottom = 24
    const innerW = chartW - padX * 2
    const innerH = chartH - padTop - padBottom
    const maxVal = Math.max(...chartData)
    const minVal = Math.min(...chartData)
    const span = maxVal - minVal || 1
    const points = chartData.map((v, i) => {
      const x =
        chartData.length === 1
          ? padX + innerW / 2
          : padX + (innerW * i) / (chartData.length - 1)
      const y = padTop + innerH - ((v - minVal) / span) * innerH
      return { x, y }
    })
    const linePath = points
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`
        const prev = points[i - 1]
        const cx = (prev.x + p.x) / 2
        return `C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`
      })
      .join(' ')
    const areaPath =
      points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${padTop + innerH} L ${points[0].x} ${padTop + innerH} Z`
        : ''
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map(
      (t) => padTop + innerH - t * innerH,
    )

    return (
      <ResponsiveGrid cols="1-lg-3" gap="md" className={props.className}>
        {/* Revenue chart */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {chartTitle}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {chartSubtitle}
              </p>
            </div>
            <div className="flex gap-2">
              {chartRanges.map((range) => {
                const active = activeRange === range
                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setActiveRange(range)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      active
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {range}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="relative h-64">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              preserveAspectRatio="none"
              className="size-full"
              role="img"
              aria-label={`${chartTitle} chart`}
            >
              <defs>
                <linearGradient
                  id="dashboard-revenue-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-primary)"
                    stopOpacity="0.25"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-primary)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              {gridLines.map((y, i) => (
                <line
                  key={i}
                  x1={padX}
                  y1={y}
                  x2={chartW - padX}
                  y2={y}
                  className="stroke-border"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
              ))}
              <path d={areaPath} fill="url(#dashboard-revenue-fill)" />
              <path
                d={linePath}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {points.map((p, i) =>
                i === points.length - 1 ? (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="var(--color-primary)"
                    stroke="var(--color-card)"
                    strokeWidth="2"
                  />
                ) : null,
              )}
            </svg>
            <div className="pointer-events-none mt-1 flex justify-between px-1 text-[0.6875rem] text-muted-foreground">
              {chartLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {activityTitle}
            </h2>
            <button
              type="button"
              onClick={() => go(activityViewAll)}
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              {activityViewAll}
            </button>
          </div>
          <div className="space-y-4">
            {activityItems.map((item, i) => {
              const tone = activityTones[item.tone ?? 'primary']
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
                <div key={i} className="flex gap-3">
                  <span
                    className={cn(
                      'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full',
                      tone.wrap,
                    )}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {tone.icon}
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      {before}
                      {bold ? (
                        <span className="font-semibold">{bold}</span>
                      ) : null}
                      {after}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ResponsiveGrid>
    )
  },
})
