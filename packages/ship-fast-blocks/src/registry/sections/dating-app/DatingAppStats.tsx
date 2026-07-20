import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * DatingAppStats — playful-geometric collapsed-border stat ledger for a dating
 * / matchmaking app. A hairline-framed band on a faint muted wash: a mono meta
 * rule ("Proof" with a rounded-full primary dot, tabular metric count right)
 * above a sharp 2/4-column collapsed-border grid of left-aligned cells, each
 * with a giant fluid extrabold tabular numeral, a mono uppercase label, and a
 * small rounded-full primary tick pill. Use as a compact social-proof divider
 * between content sections — active singles, matches this month, relationships
 * started, app rating — for dating apps, singles platforms, or any product
 * with punchy headline numbers. Renders fully with no props via baked-in
 * metric defaults.
 */
export const DatingAppStats = defineCapsule({
  name: 'DatingAppStats',
  description:
    'Playful-geometric collapsed-border stat ledger for a dating / matchmaking app: a faint muted band with a mono meta rule (rounded-full primary dot + tabular metric count) above a sharp 2/4-column collapsed-border grid of left-aligned cells, each with a giant fluid extrabold tabular numeral, a mono uppercase label, and a small rounded-full primary tick pill. Use as a compact social-proof divider between content sections — active singles, matches this month, relationships started, app rating — for dating apps, singles platforms, or any product with punchy headline numbers.',
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const statsItems = props.items?.length
      ? props.items
      : [
          { value: '2M+', label: 'Active singles' },
          { value: '847K', label: 'Matches this month' },
          { value: '12K+', label: 'Relationships started' },
          { value: '4.8★', label: 'App Store rating' },
        ]
    const tickWidths = ['w-8', 'w-12', 'w-6', 'w-10']

    return (
      <section className={cn('bg-muted/40 py-14 lg:py-20', props.className)}>
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-primary"
              />
              Proof
            </MonoTag>
            <MonoTag aria-hidden="true" tone="faint" className="tabular-nums">
              {String(statsItems.length).padStart(2, '0')} metrics
            </MonoTag>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-border"
          >
            {statsItems.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-2 border-b border-r border-border bg-background p-5 sm:p-8"
                >
                  <StatValue
                    weight="bold"
                    className="mb-0 text-[clamp(2.25rem,4.5vw,4rem)] font-extrabold leading-none tracking-tight tabular-nums"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {__iv__.label}
                  </StatLabel>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-1 h-1.5 rounded-full bg-primary/70',
                      tickWidths[i % tickWidths.length],
                    )}
                  />
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
