import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

import { ResponsiveGrid } from './ResponsiveGrid.tsx'

/**
 * KpisGrid — dedicated grid wrapper for dashboard KPI metric-card rows.
 *
 * Thin semantic wrapper over `ResponsiveGrid` that pins `cols="1-2-4"` (the
 * canonical KPI scorecard shape: 1-up on mobile, 2-up on tablet, 4-up on
 * desktop). Use this instead of bare `ResponsiveGrid cols="1-2-4"` when the
 * section is a dashboard KPI band — it makes the intent explicit and gives the
 * `kpis-grid` data-slot for styling/testing.
 *
 * For the cards themselves, compose `StatCard`, `StatCardHeader`, `StatLabel`,
 * `StatValue`, `StatDelta`, `StatIcon`, `StatCaption` from `StatGrid.tsx`.
 * For the trend arrow, use `KpiTrendArrow` (extracted from the inline SVGs
 * every KPI capsule otherwise re-declares).
 */

const KpisGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    React.ComponentProps<typeof ResponsiveGrid> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="kpis-grid"
      className={cn(className)}
      {...props}
    />
  )
})
KpisGrid.displayName = 'KpisGrid'

/**
 * KpiTrendArrow — directional arrow icon for KPI deltas.
 *
 * Extracted from the inline TrendUp/TrendDown SVGs that AnalyticsKpis and
 * DashboardKpis each re-declare. `trend="up"` renders a north-east arrow,
 * `"down"` a south-east one. Pass `children` to override the default glyph
 * (e.g. a polyline stock-chart arrow) while keeping the `kpi-trend-arrow`
 * data-slot and sizing contract.
 */
const KpiTrendArrow = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & {
    trend: 'up' | 'down'
    size?: number
    asChild?: boolean
  }
>(
  (
    { className, trend, size = 16, children, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'span'
    return (
      <Comp
        ref={ref}
        data-slot="kpi-trend-arrow"
        className={cn('inline-flex shrink-0', className)}
        {...props}
      >
        {children ?? (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {trend === 'up' ? (
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            ) : (
              <path d="M17 7l-9.2 9.2M7 7v10h10" />
            )}
          </svg>
        )}
      </Comp>
    )
  },
)
KpiTrendArrow.displayName = 'KpiTrendArrow'

export { KpisGrid, KpiTrendArrow }
