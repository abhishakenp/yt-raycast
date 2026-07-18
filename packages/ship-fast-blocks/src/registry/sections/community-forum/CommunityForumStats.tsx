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
        <Container size="lg">
          <StatGrid columns={4} gap={'wide'}>
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue
                    weight={'bold'}
                    size={'default'}
                    color={'inverted'}
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel color={'inverted'}>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
