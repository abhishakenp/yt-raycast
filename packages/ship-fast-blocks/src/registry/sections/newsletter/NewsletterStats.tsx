import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { StatGrid } from '#/section-kit/StatGrid.tsx'

/**
 * NewsletterStats — compact subscriber stats strip for an editorial newsletter.
 * A subtle muted band, separated by a top border, holding a centered 2-up (mobile)
 * / 4-up (desktop) grid of figures: each cell stacks a large serif value over a
 * small muted label. Warm, calm, literary mood with generous vertical padding.
 * Use directly beneath a newsletter hero to surface subscriber count, open rate,
 * tenure, and issues sent — or any quick social-proof metrics for newsletters,
 * publications, blogs, or content creators. Renders fully with no props via
 * baked-in defaults.
 */
export const NewsletterStats = defineCapsule({
  name: 'NewsletterStats',
  description:
    'Compact subscriber stats strip for an editorial newsletter: a subtle muted band, separated by a top border, holding a centered 2-up (mobile) / 4-up (desktop) grid of figures where each cell stacks a large serif value over a small muted label. Warm, calm, literary mood with generous vertical padding. Use directly beneath a newsletter hero to surface subscriber count, open rate, tenure, and issues sent, or any quick social-proof metrics for newsletters, publications, blogs, or content creators.',
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
        className={cn('border-t border-border bg-muted/40', props.className)}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <StatGrid
            stats={stats}
            columns={4}
            fontFamily="serif"
            weight="medium"
            className="py-12 md:py-16"
          />
        </div>
      </section>
    )
  },
})
