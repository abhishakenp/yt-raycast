import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

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
      <section className={cn('bg-muted pt-28 pb-20', props.className)}>
        <Container size="xl" className="px-6">
          <StatGrid columns={4} className={'lg:gap-12 gap-12'}>
            {stats.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue weight={'light'} size={'large'}>
                    {__iv__.value}
                  </StatValue>
                  <StatLabel>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
