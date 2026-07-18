import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'
import { StatGrid } from '#/section-kit/StatGrid.tsx'

/**
 * FoodTruckStats — a compact metrics strip on a subtle muted band. A centered 2-up
 * (mobile) / 4-up (desktop) grid of stat blocks, each a large bold value over a small
 * muted label. No imagery or links — pure at-a-glance proof. Use as a credibility strip
 * between sections on food trucks, street-food vendors, caterers or restaurants to show
 * volume served, reviews, events catered and years running.
 */
export const FoodTruckStats = defineCapsule({
  name: 'FoodTruckStats',
  description:
    'Compact metrics strip on a subtle muted band: a centered 2-up (mobile) / 4-up (desktop) grid of stat blocks, each a large bold value over a small muted label. No imagery or links — pure at-a-glance proof. Use as a credibility strip between sections on food trucks, street-food vendors, caterers or restaurants to show volume served, reviews, events catered and years running.',
  props: z.object({
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '47k', label: 'Tacos Served' },
          { value: '2,847', label: '5-Star Reviews' },
          { value: '156', label: 'Events Catered' },
          { value: '4', label: 'Years Running' },
        ]

    return (
      <section className={cn('bg-muted px-6 pt-28 pb-16', props.className)}>
        <div className="mx-auto max-w-6xl">
          <StatGrid
            stats={stats}
            columns={4}
            gap="wide"
            align="center"
            weight="bold"
            size="default"
          />
        </div>
      </section>
    )
  },
})
