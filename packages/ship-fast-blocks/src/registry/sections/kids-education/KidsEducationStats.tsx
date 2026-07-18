import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * KidsEducationStats — dark stats band for a kids / family learning platform. A
 * full-width dark (foreground) band holding a 2-up / 4-up grid of big metric
 * figures whose values rotate through primary / secondary / accent accent colors,
 * each with a muted sub-label below. Use as a social-proof / impact strip between
 * content sections for kids-education startups, children's e-learning platforms,
 * and family learning apps. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const KidsEducationStats = defineCapsule({
  name: 'KidsEducationStats',
  description:
    "Dark stats band for a kids / family learning platform: a full-width dark (foreground) band holding a 2-up / 4-up grid of big metric figures whose values rotate through primary / secondary / accent accent colors, each with a muted sub-label below. Use as a social-proof / impact strip between content sections for kids-education startups, children's e-learning platforms, and family learning apps.",
  props: z.object({
    /** Stat figures. */
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
            value: '50K+',
            label: 'Happy Learners',
          },
          {
            value: '1,200+',
            label: 'Activities & Games',
          },
          {
            value: '98%',
            label: 'Parent Satisfaction',
          },
          {
            value: '35+',
            label: 'Countries Reached',
          },
        ]
    return (
      <section
        className={cn('bg-foreground py-20 text-background', props.className)}
      >
        <Container>
          <StatGrid columns={4} gap={'wide'}>
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
