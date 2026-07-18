import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * ConstructionStats — four-up stats band for a construction / general
 * contractor page. A muted section band with a responsive grid of large
 * metric figures and labels, centered in each column. Use as a credibility
 * "by the numbers" section for construction companies, contractors, builders,
 * or any business showcasing key metrics. Renders fully with no props via
 * baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const ConstructionStats = defineCapsule({
  name: 'ConstructionStats',
  description:
    "Four-up stats band for a construction / general contractor page: a muted section band with a responsive grid of large metric figures and labels centered in each column. Use as a credibility 'by the numbers' section for construction firms, contractors, builders, or any business showcasing key metrics.",
  props: z.object({
    /** Stat items: value + label pairs. */
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
            value: '500+',
            label: 'Projects Completed',
          },
          {
            value: '38',
            label: 'Years in Business',
          },
          {
            value: '$2.4B',
            label: 'Total Project Value',
          },
          {
            value: '98%',
            label: 'Client Satisfaction',
          },
        ]
    return (
      <section className={cn('bg-muted py-16', props.className)}>
        <Container>
          <StatGrid columns={4} gap={'wide'} className={'lg:gap-12'}>
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue weight={'bold'} size={'large'}>
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
