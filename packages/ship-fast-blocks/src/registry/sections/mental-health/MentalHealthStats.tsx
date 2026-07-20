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
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * MentalHealthStats — a calm credibility ledger for a therapy practice. A
 * quiet border-y band on a soft muted wash with a mono "[ practice care ]"
 * meta line above a collapsed-border 2-to-4 column ledger of stat cells; each
 * cell carries a giant extrabold tabular numeral, a short primary tick dash,
 * and a mono uppercase micro-label. Warm, reassuring wellness aesthetic. Use
 * as a gentle social-proof strip (clients supported, licensed clinicians,
 * years in practice, satisfaction) between content sections on a therapist,
 * counselor, psychologist, or wellness-center site.
 */
export const MentalHealthStats = defineCapsule({
  name: 'MentalHealthStats',
  description:
    'Calm credibility ledger for a therapy practice: a quiet border-y band on a soft muted wash with a mono meta line above a collapsed-border 2-to-4 column ledger of stat cells, each with a giant extrabold tabular numeral, a short primary tick dash, and a mono uppercase micro-label. Warm, reassuring wellness aesthetic. Use as a gentle social-proof strip (clients supported, licensed clinicians, years in practice, satisfaction) between content sections on a therapist, counselor, psychologist, or wellness-center site.',
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '2,400+', label: 'Clients supported' },
          { value: '8', label: 'Licensed clinicians' },
          { value: '12', label: 'Years in practice' },
          { value: '94%', label: 'Client satisfaction' },
        ]

    return (
      <section
        className={cn(
          'border-y border-border bg-muted/30 py-16 sm:py-20',
          props.className,
        )}
      >
        <Container size="lg">
          <MonoTag
            aria-hidden="true"
            tone="faint"
            className="mb-8 block sm:mb-10"
          >
            [ practice care ]
          </MonoTag>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-border"
          >
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-border p-6 sm:p-8"
                >
                  <StatValue
                    weight={'bold'}
                    size={'large'}
                    color={'default'}
                    className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold leading-none tracking-tight tabular-nums"
                  >
                    {__iv__.value}
                  </StatValue>
                  <span aria-hidden="true" className="h-px w-8 bg-primary" />
                  <StatLabel
                    color={'default'}
                    className="font-mono text-[11px] uppercase tracking-[0.2em]"
                  >
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
