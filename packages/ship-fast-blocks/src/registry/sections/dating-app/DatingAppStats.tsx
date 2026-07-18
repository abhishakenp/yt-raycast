import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * DatingAppStats — a bold full-width stats band for a dating / matchmaking app. A
 * solid rose/primary band with a responsive 2/4-column grid of centered metrics,
 * each a large bold value over a softer label in the primary-foreground color. Use
 * as a high-impact social-proof divider between content sections — active singles,
 * matches this month, relationships started, app rating — for dating apps, singles
 * platforms, or any product with punchy headline numbers. Renders fully with no
 * props via baked-in metric defaults.
 */
export const DatingAppStats = defineCapsule({
  name: 'DatingAppStats',
  description:
    'Bold full-width stats band for a dating / matchmaking app: a solid rose/primary band with a responsive 2/4-column grid of centered metrics, each a large bold value over a softer label in the primary-foreground color. Use as a high-impact social-proof divider between content sections — active singles, matches this month, relationships started, app rating — for dating apps, singles platforms, or any product with punchy headline numbers.',
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

    return (
      <section className={cn('bg-primary py-20', props.className)}>
        <Container>
          <StatGrid columns={4} gap={'wide'}>
            {statsItems.map((s) => {
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
