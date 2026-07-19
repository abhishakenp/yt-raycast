import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { KpisGrid, KpiTrendArrow } from '#/section-kit/KpisGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  StatValue,
  StatLabel,
  StatDelta,
  StatIcon,
  StatCard,
  StatCardHeader,
  StatCaption,
} from '#/section-kit/StatGrid.tsx'

/**
 * AnalyticsKpis — a 4-up KPI metric-card grid for a SaaS analytics dashboard. A
 * responsive 1/2/4-column grid of bordered cards, each with a label, a large
 * value, an up/down trend delta (positive uses chart styling, negative uses
 * destructive) with a directional arrow, a rotating icon chip, and a caption.
 * Tokens-only, no links. Use as the top summary row of a dashboard — total
 * revenue, active users, conversion rate, average session, or any
 * headline-metric scorecard band. Renders fully with no props via four baked-in
 * default KPIs.
 */
export const AnalyticsKpis = defineCapsule({
  name: 'AnalyticsKpis',
  description:
    'A 4-up KPI metric-card grid for a SaaS analytics dashboard: a responsive 1/2/4-column grid of bordered cards, each with a label, large value, an up/down trend delta (positive chart styling, negative destructive) with a directional arrow, a rotating icon chip, and a caption. Tokens-only, no links. Use as the top summary row of a dashboard — total revenue, active users, conversion rate, average session, or any headline-metric scorecard band.',
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

    // ---- Inline icons (decorative, currentColor) ----
    const iconProps = {
      width: 20,
      height: 20,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      'aria-hidden': true,
    }

    const kpiIcons: ReactNode[] = [
      // currency
      <svg key="currency" {...iconProps}>
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // users
      <svg key="users" {...iconProps}>
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // bars
      <svg key="bars" {...iconProps}>
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // clock
      <svg key="clock" {...iconProps}>
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    const TrendUp = () => <KpiTrendArrow trend="up" size={16} />
    const TrendDown = () => <KpiTrendArrow trend="down" size={16} />

    return (
      <section
        aria-label="Key performance indicators"
        className={cn('bg-background py-20 lg:py-28', props.className)}
      >
        <Container size="xl">
          <KpisGrid cols="1-2-4" className="gap-6">
            {kpis.map((kpi, i) => (
              <StatCard key={kpi.label}>
                <StatCardHeader>
                  <div>
                    <StatLabel className="text-sm font-medium">
                      {kpi.label}
                    </StatLabel>
                    <StatValue
                      weight="semibold"
                      color="default"
                      className="mt-2 text-2xl text-card-foreground"
                    >
                      {kpi.value}
                    </StatValue>
                    <div
                      className={cn(
                        'mt-2 flex items-center gap-1',
                        kpi.trend === 'up'
                          ? 'text-chart-1'
                          : 'text-destructive',
                      )}
                    >
                      {kpi.trend === 'up' ? <TrendUp /> : <TrendDown />}
                      <StatDelta
                        trend={kpi.trend === 'up' ? 'up' : 'down'}
                        bare
                        className="text-sm font-medium"
                      >
                        {kpi.delta}
                      </StatDelta>
                    </div>
                  </div>
                  <StatIcon className="rounded-lg bg-muted p-2 text-muted-foreground">
                    {kpiIcons[i % kpiIcons.length]}
                  </StatIcon>
                </StatCardHeader>
                <StatCaption>{kpi.caption}</StatCaption>
              </StatCard>
            ))}
          </KpisGrid>
        </Container>
      </section>
    )
  },
})
