import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { StatGrid } from '#/section-kit/StatGrid.tsx'

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
        <div className="mx-auto max-w-7xl">
          <StatGrid
            stats={items}
            columns={4}
            gap="wide"
            fontFamily="serif"
            size="large"
            valueColor="inverted"
            labelColor="inverted"
            className="text-center sm:gap-12"
          />
        </div>
      </section>
    )
  },
})
