import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * ElectronicsStoreStats — a compact horizontally-ruled stats band for an
 * electronics storefront. A 2-to-4 column grid of centered metrics, each a large
 * bold value over a muted label, framed by top and bottom borders. Use as a
 * social-proof / scale strip between sections on electronics stores, gadget
 * shops, consumer-tech retailers, or any product catalog.
 */
export const ElectronicsStoreStats = defineCapsule({
  name: 'ElectronicsStoreStats',
  description:
    'Compact horizontally-ruled stats band for an electronics storefront: a 2-to-4 column grid of centered metrics, each a large bold value over a muted label, framed by top and bottom borders. Use as a social-proof / scale strip (e.g. 50K+ Happy Customers, 1,200+ Products, 4.9 Average Rating, 24/7 Support) between sections on electronics stores, gadget shops, consumer-tech retailers, or any product catalog.',
  props: z.object({
    /** Stat cells. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '50K+', label: 'Happy Customers' },
          { value: '1,200+', label: 'Products Available' },
          { value: '4.9', label: 'Average Rating' },
          { value: '24/7', label: 'Customer Support' },
        ]

    return (
      <section
        className={cn('border-y border-border py-16 lg:py-20', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="mb-2 text-4xl font-semibold text-foreground">
                  {s.value}
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
