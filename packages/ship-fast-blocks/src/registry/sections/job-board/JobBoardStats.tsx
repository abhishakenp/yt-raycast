import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * JobBoardStats — a dark, high-contrast metrics band for a job-board / careers
 * site. A full-width inverted band (foreground bg, background text) holding a
 * 2-up / 4-up grid of big bold stat figures each above a muted caption label.
 * Use as a confidence-building break between sections on job boards, hiring
 * marketplaces or recruiting platforms (active listings, companies hiring,
 * placements, time-to-hire). Static (no links). Renders fully with no props.
 */
export const JobBoardStats = defineCapsule({
  name: 'JobBoardStats',
  description:
    'Dark, high-contrast metrics band for a job-board / careers site: a full-width inverted band (foreground bg, background text) holding a 2-up / 4-up grid of big bold stat figures each above a muted caption label. Use as a confidence-building break between sections on job boards, hiring marketplaces or recruiting platforms (active listings, companies hiring, placements, time-to-hire).',
  props: z.object({
    /** Stat figures: value + label. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '12k+', label: 'Active job listings' },
          { value: '3.2k', label: 'Companies hiring' },
          { value: '48k', label: 'Successful placements' },
          { value: '14 days', label: 'Average time to hire' },
        ]

    return (
      <section
        className={cn('bg-foreground py-20 text-background', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {items.map((s) => (
              <div key={s.label} className="text-center">
                <div className="mb-2 text-4xl font-bold sm:text-5xl">
                  {s.value}
                </div>
                <p className="text-background/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
