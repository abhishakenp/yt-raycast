import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'
import { dashboardLakebed } from './dashboard-lakebed.ts'

/**
 * DashboardKpis — a 4-up KPI stat-card row for a SaaS admin dashboard. A
 * responsive 1/2/4-column grid of bordered card tiles, each pairing a label,
 * a large bold value and an up/down trend badge (green chart styling for up,
 * destructive for down, with a directional arrow + optional caption) on the
 * left, and a tone-tinted colored icon tile on the right. Tones rotate across
 * the data-viz tokens (primary / orange / sky / violet / emerald). Tokens-only,
 * no links. Use as the headline-metric summary row at the top of a dashboard —
 * revenue, orders, customers, average order value. Renders fully with no props
 * via four baked-in default KPIs.
 */
export const DashboardKpis = defineCapsule({
  name: 'DashboardKpis',
  description:
    'A 4-up KPI stat-card row for a SaaS admin dashboard: a responsive 1/2/4-column grid of bordered card tiles, each pairing a label, a large bold value and an up/down trend badge (green chart styling for up, destructive for down, with a directional arrow + optional caption) on the left, and a tone-tinted colored icon tile on the right. The Orders KPI reads shared Lakebed dashboard order state so generated admin counters react to mutations. Tones rotate across the data-viz tokens (primary / orange / sky / violet / emerald). Tokens-only, no links. Use as the headline-metric summary row at the top of a dashboard — revenue, orders, customers, average order value.',
  props: z.object({
    /** KPI stat cards. `tone` colors the icon tile; `trendUp` true = green up trend, false = red down trend. */
    kpis: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          delta: z.string(),
          trendUp: z.boolean().optional(),
          deltaNote: z.string().optional(),
          tone: z
            .enum(['primary', 'orange', 'sky', 'violet', 'emerald'])
            .optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: dashboardLakebed,
  component: ({ props, lakebed }) => {
    const orderSummary = lakebed.useQuery('orderSummary')
    const liveOrderCount = String(orderSummary?.count ?? 0)
    const baseKpis = props.kpis?.length
      ? props.kpis
      : [
          {
            label: 'Total Revenue',
            value: '$48,294',
            delta: '12.5%',
            trendUp: true,
            deltaNote: 'vs last month',
            tone: 'primary' as const,
          },
          {
            label: 'Orders',
            value: '1,247',
            delta: '8.2%',
            trendUp: true,
            deltaNote: 'vs last month',
            tone: 'orange' as const,
          },
          {
            label: 'Active Customers',
            value: '3,842',
            delta: '5.1%',
            trendUp: true,
            deltaNote: 'vs last month',
            tone: 'sky' as const,
          },
          {
            label: 'Avg. Order Value',
            value: '$87.40',
            delta: '2.3%',
            trendUp: false,
            deltaNote: 'vs last month',
            tone: 'violet' as const,
          },
        ]
    const kpis = baseKpis.map((kpi) =>
      kpi.label.toLowerCase().includes('order')
        ? { ...kpi, value: liveOrderCount }
        : kpi,
    )

    // ── KPI icon tints (data-viz tokens for a multi-color decorative set). ──
    const kpiTones: Record<string, string> = {
      primary: 'bg-primary/10 text-primary',
      orange: 'bg-chart-3/10 text-chart-3',
      sky: 'bg-chart-2/10 text-chart-2',
      violet: 'bg-chart-5/10 text-chart-5',
      emerald: 'bg-chart-1/10 text-chart-1',
    }
    const kpiIcons: Record<string, ReactNode> = {
      primary: (
        <>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      ),
      orange: (
        <>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </>
      ),
      sky: (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      ),
      violet: (
        <>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </>
      ),
      emerald: (
        <>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      ),
    }

    return (
      <ResponsiveGrid cols="1-2-4" gap="sm" className={props.className}>
        {kpis.map((kpi) => {
          const tone = kpi.tone ?? 'primary'
          const up = kpi.trendUp ?? true
          return (
            <div
              key={kpi.label}
              aria-label={`${kpi.label}: ${kpi.value}`}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_4px_10px_-4px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {kpi.value}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <span
                      className={cn(
                        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold',
                        up
                          ? 'bg-chart-1/10 text-chart-1'
                          : 'bg-destructive/10 text-destructive',
                      )}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="mr-0.5"
                      >
                        {up ? (
                          <>
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                          </>
                        ) : (
                          <>
                            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                            <polyline points="17 18 23 18 23 12" />
                          </>
                        )}
                      </svg>
                      {kpi.delta}
                    </span>
                    {kpi.deltaNote ? (
                      <span className="text-xs text-muted-foreground">
                        {kpi.deltaNote}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span
                  className={cn(
                    'grid size-10 place-items-center rounded-lg',
                    kpiTones[tone],
                  )}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {kpiIcons[tone]}
                  </svg>
                </span>
              </div>
            </div>
          )
        })}
      </ResponsiveGrid>
    )
  },
})
