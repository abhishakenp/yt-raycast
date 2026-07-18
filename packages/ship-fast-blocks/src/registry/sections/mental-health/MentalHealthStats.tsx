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

/**
 * MentalHealthStats — a bold full-bleed stats band for a therapy practice. A
 * solid primary-colored section holding a responsive 2/4-column grid of large
 * metric figures with soft sub-labels in primary-foreground. Calm yet confident
 * wellness aesthetic. Use as a reassuring social-proof strip (clients supported,
 * licensed clinicians, years in practice, satisfaction) for therapists,
 * counselors, psychologists or wellness centers.
 */
export const MentalHealthStats = defineCapsule({
  name: 'MentalHealthStats',
  description:
    'Bold full-bleed stats band for a therapy practice: a solid primary-colored section holding a responsive 2/4-column grid of large metric figures with soft sub-labels in primary-foreground. Calm yet confident wellness aesthetic. Use as a reassuring social-proof strip (clients supported, licensed clinicians, years in practice, satisfaction) for therapists, counselors, psychologists or wellness centers.',
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '2,400+', label: 'Clients supported' },
          { value: '8', label: 'Licensed clinicians' },
          { value: '12', label: 'Years in practice' },
          { value: '94%', label: 'Client satisfaction' },
        ]

    return (
      <section className={cn('bg-primary py-16', props.className)}>
        <Container size="lg">
          <StatGrid columns={4} className={'text-center'}>
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label}>
                  <StatValue
                    weight={'semibold'}
                    size={'large'}
                    color={'primaryFg'}
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel color={'primaryFg'}>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
