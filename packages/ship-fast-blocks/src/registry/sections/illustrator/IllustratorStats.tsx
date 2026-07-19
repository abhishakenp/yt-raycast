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
 * IllustratorStats — a compact dark stats band for an illustrator /
 * visual-artist portfolio. A full-width foreground-colored band with inverted
 * type holds a centered responsive grid of big serif metric values over small
 * muted labels (books published, prints sold, happy clients, awards). Use as a
 * high-contrast achievements strip between content sections. Renders fully with
 * no props via baked-in defaults.
 */
export const IllustratorStats = defineCapsule({
  name: 'IllustratorStats',
  description:
    'Compact dark stats band for an illustrator / visual-artist portfolio: a full-width foreground-colored band with inverted type holding a centered responsive grid of big serif metric values over small muted labels (books published, prints sold, happy clients, awards). Use as a high-contrast achievements strip between content sections.',
  props: z.object({
    /** Metric items shown across the band. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '47', label: 'Books Published' },
          { value: '12k+', label: 'Prints Sold' },
          { value: '35', label: 'Happy Clients' },
          { value: '3', label: 'Industry Awards' },
        ]

    return (
      <section
        className={cn(
          'bg-foreground px-4 py-16 text-background sm:px-6 sm:py-20 lg:px-8',
          props.className,
        )}
      >
        <Container size="xl">
          <StatGrid
            columns={4}

            className={'text-center sm:gap-12 gap-12'}
          >
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label}>
                  <StatValue
                    fontFamily={'serif'}
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
