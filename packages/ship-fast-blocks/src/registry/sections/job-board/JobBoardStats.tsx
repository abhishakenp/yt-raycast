import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * JobBoardStats — a dark, high-contrast metrics band for a job-board / careers
 * site. A full-width inverted band (foreground bg, background text) holding a
 * 2-up / 4-up grid of big bold stat figures each above a muted caption label.
 * Use as a confidence-building break between sections on job boards, hiring
 * marketplaces or recruiting platforms (active listings, companies hiring,
 * placements, time-to-hire). Static (no links). Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const JobBoardStats = defineCapsule({
  name: 'JobBoardStats',
  description:
    'Dark, high-contrast metrics band for a job-board / careers site: a full-width inverted band (foreground bg, background text) holding a 2-up / 4-up grid of big bold stat figures each above a muted caption label. Use as a confidence-building break between sections on job boards, hiring marketplaces or recruiting platforms (active listings, companies hiring, placements, time-to-hire).',
  props: z.object({
    /** Stat figures: value + label. */
    items: z
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
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '12k+',
            label: 'Active job listings',
          },
          {
            value: '3.2k',
            label: 'Companies hiring',
          },
          {
            value: '48k',
            label: 'Successful placements',
          },
          {
            value: '14 days',
            label: 'Average time to hire',
          },
        ]
    return (
      <section
        className={cn('bg-foreground py-20 text-background', props.className)}
      >
        <Container>
          <StatGrid columns={4} gap={'wide'} className={'lg:gap-12'}>
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue weight={'bold'} size={'large'} color={'inverted'}>
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
