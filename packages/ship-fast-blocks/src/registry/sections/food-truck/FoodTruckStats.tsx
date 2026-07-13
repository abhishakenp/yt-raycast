import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

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
          <ResponsiveGrid cols="2-md-4" gap="lg" className="text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-foreground md:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
