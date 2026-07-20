import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * FitnessStats — bold primary-filled stats band for a gym or fitness studio. A
 * full-width primary-colored strip with a centered 2/4-column row of big metric
 * numbers over small muted labels (members, weekly classes, trainers, square feet).
 * Renders fully on zero args. Use as a high-contrast proof band between sections on
 * gyms, fitness studios, yoga / pilates / boxing / spin studios or wellness clubs.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const FitnessStats = defineCapsule({
  name: 'FitnessStats',
  description:
    'Bold primary-filled stats band for a gym or fitness studio: a full-width primary-colored strip with a centered 2/4-column row of big metric numbers over small muted labels (active members, weekly classes, expert trainers, square feet). Use as a high-contrast social-proof / by-the-numbers band between sections on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios and wellness clubs.',
  props: z.object({
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
    const statsItems = props.items?.length
      ? props.items
      : [
          {
            value: '3,200+',
            label: 'Active members',
          },
          {
            value: '45+',
            label: 'Weekly classes',
          },
          {
            value: '12',
            label: 'Expert trainers',
          },
          {
            value: '12k',
            label: 'Square feet',
          },
        ]
    return (
      <section className={cn('bg-primary py-16', props.className)}>
        <Container>
          <StatGrid columns={4} className="gap-12">
            {statsItems.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue
                    weight={'semibold'}
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
