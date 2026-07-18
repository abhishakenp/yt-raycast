import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'
import { StatGrid } from '#/section-kit/StatGrid.tsx'

/**
 * InteriorDesignStats — compact metrics band on a muted surface for an upscale
 * interior-design / architecture studio. A border-top-and-bottom muted band with
 * a centered responsive 2/4-column grid of stats, each a large light-weight
 * value over a small muted label. Editorial and understated. Use as a social-
 * proof strip — projects completed, years of experience, awards, satisfaction —
 * for interior designers, design studios or architecture firms. Renders fully
 * with no props via baked-in defaults.
 */
export const InteriorDesignStats = defineCapsule({
  name: 'InteriorDesignStats',
  description:
    'Compact metrics band on a muted surface for an upscale interior-design / architecture studio: a border-top-and-bottom muted band with a centered responsive 2/4-column grid of stats, each a large light-weight value over a small muted label. Editorial and understated. Use as a social-proof strip — projects completed, years of experience, awards, client satisfaction — for interior designers, design studios or architecture firms.',
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
          { value: '250+', label: 'Projects Completed' },
          { value: '10', label: 'Years Experience' },
          { value: '15', label: 'Design Awards' },
          { value: '98%', label: 'Client Satisfaction' },
        ]

    return (
      <section
        className={cn(
          'border-y border-border bg-muted px-4 py-16 sm:px-6 md:py-24 lg:px-8',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <StatGrid
            stats={items}
            columns={4}
            gap="wide"
            align="center"
            weight="light"
            size="large"
            className="text-center md:gap-12"
          />
        </div>
      </section>
    )
  },
})
