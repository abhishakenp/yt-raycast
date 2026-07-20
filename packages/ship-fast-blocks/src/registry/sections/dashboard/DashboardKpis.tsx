import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { KpisGrid, KpiTrendArrow } from '#/section-kit/KpisGrid.tsx'
import {
  StatValue,
  StatLabel,
  StatDelta,
  StatIcon,
  StatCard,
  StatCardHeader,
} from '#/section-kit/StatGrid.tsx'
import { dashboardLakebed } from './dashboard-lakebed.ts'

/**
 * DashboardKpis — Swiss-data KPI ledger row for a SaaS admin dashboard. A
 * mono "Metrics · Live" meta rail with a tabular indicator count sits above a
 * collapsed-border hairline grid of square stat cells (no gaps, shared rules,
 * rounded-none). The first KPI is the hero: it spans two columns and carries an
 * oversized tabular numeral; the rest stay dense. Every cell pairs a mono
 * uppercase label, a big tabular-nums value, a bare trend delta (chart-green
 * up / destructive down, with a directional arrow + optional mono caption) and
 * a div-built spark bar strip whose last tick takes the trend color; a quiet
 * hairline-framed line icon sits top-right. The Orders KPI reads shared
 * Lakebed dashboard order state so generated admin counters react to
 * mutations. Use as the headline-metric summary row at the top of a dashboard
 * — revenue, orders, customers, average order value. Renders fully with no
 * props via four baked-in default KPIs.
 */
export const DashboardKpis = defineCapsule({
  name: 'DashboardKpis',
  description:
    'Swiss-data KPI ledger row for a SaaS admin dashboard: a mono "Metrics · Live" meta rail with a tabular indicator count above a collapsed-border hairline grid of square stat cells — the first KPI is a two-column hero with an oversized tabular numeral, the rest stay dense. Each cell pairs a mono uppercase label, a tabular-nums value, a bare up/down trend delta (chart-green up, destructive down, directional arrow + optional caption) and a div-built spark bar strip whose last tick takes the trend color, plus a quiet hairline line icon. The Orders KPI reads shared Lakebed dashboard order state so generated admin counters react to mutations. Tokens-only, no links. Use as the headline-metric summary row at the top of a dashboard — revenue, orders, customers, average order value.',
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
    const orderSummary = lakebed.useQuery('orderSummary') as
      | { count: number; currentOrderId: string }
      | undefined
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

    // ── Quiet hairline-framed line icons (glyph chosen by tone key). ──
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

    // ── Deterministic spark-bar heights (percent), rotated per cell. ──
    const sparkBase = [34, 52, 40, 66, 48, 74, 58, 82, 70, 95]

    return (
      <section className={cn('bg-background py-10 sm:py-14', props.className)}>
        <Container>
          <div
            aria-hidden="true"
            className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            <span className="flex items-center gap-2.5">
              <span className="size-1.5 bg-primary" />
              Metrics · Live
            </span>
            <span className="tabular-nums text-muted-foreground/60">
              {String(kpis.length).padStart(2, '0')} indicators
            </span>
          </div>
          <KpisGrid
            cols="1-2-4"
            className="grid grid-cols-2 gap-0 border-l border-t border-border lg:grid-cols-5"
          >
            {kpis.map((kpi, i) => {
              const tone = kpi.tone ?? 'primary'
              const up = kpi.trendUp ?? true
              const hero = i === 0
              // Fill the collapsed grid's last mobile row when the non-hero
              // cell count is odd (hero already spans both columns).
              const fillsLastRow =
                i === kpis.length - 1 && (kpis.length - 1) % 2 === 1
              return (
                <StatCard
                  key={kpi.label}
                  aria-label={`${kpi.label}: ${kpi.value}`}
                  className={cn(
                    'rounded-none border-0 border-b border-r border-border bg-card p-4 sm:p-5',
                    hero && 'col-span-2',
                    !hero && fillsLastRow && 'col-span-2 lg:col-span-1',
                  )}
                >
                  <StatCardHeader className="gap-3">
                    <div className="min-w-0">
                      <StatLabel className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {kpi.label}
                      </StatLabel>
                      <StatValue
                        className={cn(
                          'mt-2 block leading-none',
                          hero
                            ? 'text-4xl font-extrabold sm:text-5xl'
                            : 'text-2xl font-bold sm:text-3xl',
                        )}
                      >
                        {kpi.value}
                      </StatValue>
                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <StatDelta
                          trend={up ? 'up' : 'down'}
                          bare
                          className="gap-1 bg-transparent font-mono text-[11px] font-semibold tabular-nums"
                        >
                          <KpiTrendArrow trend={up ? 'up' : 'down'} size={12} />
                          {kpi.delta}
                        </StatDelta>
                        {kpi.deltaNote ? (
                          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">
                            {kpi.deltaNote}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <StatIcon className="size-8 shrink-0 rounded-none border border-border bg-transparent text-muted-foreground/60">
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
                        {kpiIcons[tone]}
                      </svg>
                    </StatIcon>
                  </StatCardHeader>
                  <span
                    aria-hidden="true"
                    className="mt-4 flex h-6 items-end gap-px"
                  >
                    {sparkBase.map((_, j) => {
                      const h = sparkBase[(i * 3 + j) % sparkBase.length]
                      const last = j === sparkBase.length - 1
                      return (
                        <span
                          key={j}
                          className={cn(
                            'w-1.5',
                            last
                              ? up
                                ? 'bg-chart-1'
                                : 'bg-destructive'
                              : 'bg-foreground/15',
                          )}
                          style={{ height: `${h}%` }}
                        />
                      )
                    })}
                  </span>
                </StatCard>
              )
            })}
          </KpisGrid>
        </Container>
      </section>
    )
  },
})
