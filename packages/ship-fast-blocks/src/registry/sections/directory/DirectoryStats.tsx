import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * DirectoryStats — compact 4-up statistics band for a local-business directory.
 * A muted, border-topped-and-bottomed strip with a centered responsive grid of
 * big-number metrics (value + label) — typically businesses listed, verified
 * reviews, cities covered, and average rating. Static, no links. Use directly
 * beneath the hero of local directories, listing marketplaces, or
 * review-and-discovery sites to convey scale and trust.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const DirectoryStats = defineCapsule({
  name: 'DirectoryStats',
  description:
    'Compact 4-up statistics band for a local-business DIRECTORY: a muted, border-topped-and-bottomed strip with a centered responsive grid of big-number metrics (value plus label) — typically businesses listed, verified reviews, cities covered, and average rating. Static, no links. Use directly beneath the hero of local directories, listing marketplaces, find-a-service platforms, or review-and-discovery sites to convey scale and trust.',
  props: z.object({
    /** Stat tiles (big value + label). */
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          {
            value: '12,450+',
            label: 'Local Businesses',
          },
          {
            value: '48,200+',
            label: 'Verified Reviews',
          },
          {
            value: '156',
            label: 'Cities Covered',
          },
          {
            value: '4.8',
            label: 'Average Rating',
          },
        ]
    return (
      <section
        className={cn('border-y border-border bg-muted py-12', props.className)}
      >
        <Container>
          <StatGrid columns={4} gap={'wide'}>
            {stats.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue weight={'semibold'} size={'default'}>
                    {__iv__.value}
                  </StatValue>
                  <StatLabel>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
