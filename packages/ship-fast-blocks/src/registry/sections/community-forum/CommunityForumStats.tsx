import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * CommunityForumStats — dark KPI stats band for a community-platform / discussion-forum
 * landing page. A near-foreground (dark) horizontal band with a 4-column grid of large metric
 * values and labels in background colors. Used to communicate scale, reliability, and reach.
 * No links. Use as the social-proof / credibility band for community platforms, SaaS products,
 * or enterprise landing pages.
 */
export const CommunityForumStats = defineCapsule({
  name: 'CommunityForumStats',
  description:
    'Dark KPI stats band for a community-platform / discussion-forum landing page: a near-foreground (dark) horizontal band with a 4-column grid of large metric values and labels in background colors. Used to communicate scale, reliability, and reach. No links. Use as the social-proof / credibility band for community platforms, SaaS products, or enterprise landing pages.',
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
          { value: '12,000+', label: 'Active Communities' },
          { value: '2.4M', label: 'Monthly Discussions' },
          { value: '98.7%', label: 'Uptime SLA' },
          { value: '156', label: 'Countries Reached' },
        ]

    return (
      <section className={cn('bg-foreground py-16', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ResponsiveGrid cols="2-lg-4" gap="lg" className="text-center">
            {items.map((s) => (
              <div key={s.label}>
                <div className="mb-2 text-3xl font-bold text-background sm:text-4xl">
                  {s.value}
                </div>
                <div className="text-sm text-background/60">{s.label}</div>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
