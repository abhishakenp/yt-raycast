import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * FoodTruckStats — a sticker-poster proof ledger. Under a hazard-lite accent rule and
 * a rotated rubber-stamp caption, a collapsed-border 2-up (mobile) / 4-up (desktop)
 * grid of stat cells, each a giant extrabold tabular value over a mono index micro-label.
 * No imagery or links — pure at-a-glance proof. Use as a credibility strip between
 * sections on food trucks, street-food vendors, caterers or restaurants to show volume
 * served, reviews, events catered and years running.
 */
export const FoodTruckStats = defineCapsule({
  name: 'FoodTruckStats',
  description:
    'Sticker-poster proof ledger: under a hazard-lite accent rule and a rotated rubber-stamp caption, a collapsed-border 2-up (mobile) / 4-up (desktop) grid of stat cells, each a giant extrabold tabular value over a mono index micro-label. No imagery or links — pure at-a-glance proof. Use as a credibility strip between sections on food trucks, street-food vendors, caterers or restaurants to show volume served, reviews, events catered and years running.',
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
      <section className={cn('bg-muted px-6 pt-24 pb-16', props.className)}>
        <Container size="lg">
          <div
            aria-hidden="true"
            className="mb-6 h-1.5 w-full bg-[repeating-linear-gradient(45deg,currentColor_0px,currentColor_3px,transparent_3px,transparent_9px)] text-foreground/20"
          />
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex rotate-1 items-center rounded-full border-2 border-foreground bg-background px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[3px_3px_0_0] shadow-primary/40">
              Served Fresh
            </span>
            <MonoTag>By the numbers</MonoTag>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l-2 border-t-2 border-foreground"
          >
            {stats.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-2 border-b-2 border-r-2 border-foreground p-5 sm:p-6"
                >
                  <StatValue
                    weight={'bold'}
                    size={'default'}
                    className="text-4xl font-extrabold tabular-nums sm:text-5xl"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    {String(i + 1).padStart(2, '0')} / {__iv__.label}
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
