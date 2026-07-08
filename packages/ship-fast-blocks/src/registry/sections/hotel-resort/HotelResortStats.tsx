import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * HotelResortStats — quiet KPI stats band for a luxury hotel / resort & spa
 * site. A muted-surface section with a 2-up (mobile) / 4-up (desktop) grid of
 * centered figures: a large thin value over a small uppercase tracked label.
 * Editorial and understated. Use beneath a hero to surface signature numbers —
 * suite count, Michelin stars, spa square footage, miles of beach — for hotels,
 * resorts, spa retreats, inns, or wellness destinations. Renders fully with no
 * props via baked-in resort defaults.
 */
export const HotelResortStats = defineCapsule({
  name: 'HotelResortStats',
  description:
    'Quiet KPI stats band for a luxury hotel / resort & spa site: a muted-surface section with a 2-up (mobile) / 4-up (desktop) grid of centered figures, each a large thin value over a small uppercase tracked label. Editorial and understated. Use beneath a hero to surface signature numbers — suite count, Michelin stars, spa square footage, miles of beach — for hotels, resorts, spa retreats, inns, or wellness destinations.',
  props: z.object({
    /** KPI figures: value + label pairs. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '47', label: 'Exclusive Suites' },
          { value: '3', label: 'Michelin Stars' },
          { value: '12K', label: 'Sq Ft Spa' },
          { value: '1.2', label: 'Miles of Beach' },
        ]

    return (
      <section className={cn('bg-muted py-20', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ResponsiveGrid cols="2-lg-4" gap="lg" className="lg:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="mb-2 text-4xl font-light text-foreground lg:text-5xl">
                  {s.value}
                </p>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
