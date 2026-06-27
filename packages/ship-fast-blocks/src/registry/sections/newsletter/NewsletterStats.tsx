import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

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
          <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 md:py-16">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="mb-1 font-serif text-3xl font-medium text-foreground md:text-4xl">
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
