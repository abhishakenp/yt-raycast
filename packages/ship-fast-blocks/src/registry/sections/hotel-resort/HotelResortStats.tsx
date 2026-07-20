import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * HotelResortStats — quiet KPI ledger band for a luxury-editorial hotel /
 * resort & spa site. A muted-surface section carrying a mono micro-label and a
 * giant ghost serif watermark, with a hairline-ruled 2-up (mobile) / 4-up
 * (desktop) ledger of left-aligned figures: a large thin serif tabular value
 * over a small mono uppercase label, each cell divided by a hairline rule.
 * Editorial and understated. Use beneath a hero to surface signature numbers —
 * suite count, Michelin stars, spa square footage, miles of beach — for hotels,
 * resorts, spa retreats, inns, or wellness destinations. Renders fully with no
 * props via baked-in resort defaults.
 */
export const HotelResortStats = defineCapsule({
  name: 'HotelResortStats',
  description:
    'Quiet KPI ledger band for a luxury-editorial hotel / resort & spa site: a muted-surface section with a mono micro-label and a giant ghost serif watermark, and a hairline-ruled 2-up (mobile) / 4-up (desktop) ledger of left-aligned figures, each a large thin serif tabular value over a small mono uppercase label divided by hairline rules. Editorial and understated. Use beneath a hero to surface signature numbers — suite count, Michelin stars, spa square footage, miles of beach — for hotels, resorts, spa retreats, inns, or wellness destinations.',
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
      <section
        className={cn(
          'relative overflow-hidden bg-muted pt-24 pb-20',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-6 select-none font-serif text-[10rem] font-normal leading-none tracking-tighter text-foreground/[0.04] lg:text-[16rem]"
        >
          §
        </span>
        <Container size="xl" className="relative px-6">
          <div className="mb-12 flex items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              By the Numbers
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-t border-border sm:border-t-0"
          >
            {stats.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="border-b border-border py-8 sm:border-b-0 sm:border-l sm:py-0 sm:pl-6 sm:first:border-l-0"
                >
                  <StatValue
                    weight={'light'}
                    size={'large'}
                    fontFamily={'serif'}
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.16em]">
                    {__iv__.label}
                  </StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
