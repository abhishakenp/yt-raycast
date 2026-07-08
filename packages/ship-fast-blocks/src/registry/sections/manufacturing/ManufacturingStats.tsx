import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * ManufacturingStats — a compact company stats band for a precision-
 * manufacturing site. A muted, top-and-bottom-bordered strip with a screen-
 * reader heading above a two- to four-column grid of large semibold numbers each
 * over a small muted label. Quiet, credible proof-by-numbers. Use between
 * content sections on machine-shop, fabricator or contract-manufacturer pages to
 * surface facility size, machine count, headcount and parts shipped. Renders
 * fully with no props via baked-in defaults.
 */
export const ManufacturingStats = defineCapsule({
  name: 'ManufacturingStats',
  description:
    'A compact company stats band for a precision-manufacturing site: a muted, top-and-bottom-bordered strip with a screen-reader heading above a two- to four-column grid of large semibold numbers each over a small muted label. Quiet, credible proof-by-numbers. Use between content sections on machine-shop, fabricator or contract-manufacturer pages to surface facility size, machine count, headcount and parts shipped.',
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
          { value: '180K', label: 'Square Feet Facility' },
          { value: '50+', label: 'CNC Machines' },
          { value: '350', label: 'Skilled Employees' },
          { value: '1.2M+', label: 'Parts Shipped (2024)' },
        ]

    return (
      <section
        className={cn('border-y border-border bg-muted py-16', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Company Statistics</h2>
          <ResponsiveGrid cols="2-lg-4" gap="lg" className="text-center">
            {items.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-semibold text-foreground lg:text-5xl">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
