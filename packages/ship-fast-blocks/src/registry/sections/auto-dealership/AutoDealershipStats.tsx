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
 * AutoDealershipStats — bold full-bleed stats band for an auto dealership site.
 * A solid primary-colored section with a responsive 2-up / 4-up grid of large
 * metric figures (years in business, vehicles sold, Google rating, repeat
 * customers) over softened captions. Static, content-only — no links. Use as a
 * confidence / credibility band between sections for car dealerships, used-car
 * lots, or auto sales groups. Renders fully with no props via baked-in defaults.
 */
export const AutoDealershipStats = defineCapsule({
  name: 'AutoDealershipStats',
  description:
    'Bold full-bleed stats band for an auto dealership site: a solid primary-colored section with a responsive 2-up / 4-up grid of large metric figures (years in business, vehicles sold, Google rating, repeat customers) over softened captions. Static and content-only with no links. Use as a confidence / credibility band between sections for car dealerships, used-car lots, or auto sales groups.',
  props: z.object({
    /** Metric figures shown in the band. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '15+', label: 'Years in Business' },
          { value: '8,500+', label: 'Vehicles Sold' },
          { value: '4.9', label: 'Google Rating' },
          { value: '78%', label: 'Repeat Customers' },
        ]

    return (
      <section
        className={cn(
          'bg-primary py-16 text-primary-foreground lg:py-20',
          props.className,
        )}
      >
        <Container>
          <StatGrid
            columns={4}

            className={'text-center lg:gap-12 gap-12'}
          >
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue
                    weight={'semibold'}
                    size={'large'}
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
