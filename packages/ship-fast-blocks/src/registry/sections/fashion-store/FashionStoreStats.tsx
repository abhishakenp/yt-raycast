import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * FashionStoreStats — slim brand stats strip for a minimalist fashion store. A
 * top-and-bottom bordered band with a centered 2-to-4 column grid of stat
 * blocks, each pairing a large serif value with a small muted label. Use to
 * surface headline metrics — customers, markets, ratings, sustainability — for
 * clothing brands, boutiques, or any premium retail storefront.
 */
export const FashionStoreStats = defineCapsule({
  name: 'FashionStoreStats',
  description:
    'Slim brand stats strip for a minimalist fashion store: a top-and-bottom bordered band with a centered 2-to-4 column grid of stat blocks, each pairing a large serif value with a small muted label. Use to surface headline metrics — happy customers, global markets, average rating, carbon neutrality — for clothing brands, boutiques, or any premium retail storefront.',
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const statsItems = props.items?.length
      ? props.items
      : [
          { value: '50K+', label: 'Happy Customers' },
          { value: '12', label: 'Global Markets' },
          { value: '100%', label: 'Carbon Neutral' },
          { value: '4.9', label: 'Average Rating' },
        ]

    return (
      <section
        aria-label="Brand statistics"
        className={cn('border-y border-border py-20 lg:py-32', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ResponsiveGrid
            cols="2-lg-4"
            gap="lg"
            className="text-center lg:gap-12"
          >
            {statsItems.map((s) => (
              <div key={s.label}>
                <p className="mb-2 font-serif text-5xl text-foreground lg:text-6xl">
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
