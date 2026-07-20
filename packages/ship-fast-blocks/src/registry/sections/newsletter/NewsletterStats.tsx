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
 * NewsletterStats — newsprint-lite circulation ledger for an editorial
 * newsletter. A hairline-ruled meta rail (a primary square + mono "Circulation"
 * label on the left, a mono "By the numbers" tag on the right) sits above a
 * collapsed-border 2-up (mobile) / 4-up (desktop) figure ledger: every cell
 * shares thin hairline rules and stacks a mono issue-index numeral, a large
 * serif tabular value, and a mono uppercase label. Clean paper-toned surface
 * with restrained newspaper structure. Use directly beneath a newsletter hero to
 * surface subscriber count, open rate, tenure, and issues sent — or any quick
 * social-proof metrics for newsletters, publications, blogs, or content
 * creators. Renders fully with no props via baked-in defaults.
 */
export const NewsletterStats = defineCapsule({
  name: 'NewsletterStats',
  description:
    'Newsprint-lite circulation ledger for an editorial newsletter: a hairline-ruled meta rail (a primary square + mono "Circulation" label on the left, a mono "By the numbers" tag on the right) above a collapsed-border 2-up (mobile) / 4-up (desktop) figure ledger where every cell shares thin hairline rules and stacks a mono issue-index numeral, a large serif tabular value, and a mono uppercase label. Clean paper-toned surface with restrained newspaper structure. Use directly beneath a newsletter hero to surface subscriber count, open rate, tenure, and issues sent, or any quick social-proof metrics for newsletters, publications, blogs, or content creators.',
  props: z.object({
    /** Stat figures: each a value + label. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '12,400+', label: 'Subscribers' },
          { value: '47%', label: 'Open Rate' },
          { value: '3 years', label: 'Publishing' },
          { value: '156', label: 'Issues Sent' },
        ]

    return (
      <section
        className={cn(
          'border-t border-border bg-muted/30 py-14 md:py-16',
          props.className,
        )}
      >
        <Container size="lg">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag className="flex items-center gap-3 tracking-[0.25em]">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              Circulation
            </MonoTag>
            <MonoTag className="tracking-[0.25em]">By the numbers</MonoTag>
          </div>

          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-border"
          >
            {stats.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-2 border-b border-r border-border p-6 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 tabular-nums"
                  >
                    №{String(i + 1).padStart(2, '0')}
                  </span>
                  <StatValue
                    fontFamily={'serif'}
                    weight={'medium'}
                    className="mb-0 text-4xl leading-none lg:text-5xl"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em]">
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
