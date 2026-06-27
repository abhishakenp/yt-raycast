import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
            {items.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-semibold lg:text-5xl">{s.value}</p>
                <p className="mt-2 text-sm text-primary-foreground/70">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
