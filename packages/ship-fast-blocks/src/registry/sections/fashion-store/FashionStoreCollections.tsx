import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * FashionStoreCollections — Shop-by-Category collection grid for a minimalist
 * fashion store. A centered eyebrow + serif heading above a responsive 1-to-4
 * column grid of tall portrait category cards, each a full-bleed image with a
 * darkening scrim that deepens on hover and an overlaid serif category name +
 * piece count. Every card routes through useNavigate and imagery uses the
 * alt-driven Image component. Use to let shoppers browse by department for
 * clothing brands, boutiques, or apparel and accessories shops.
 */
export const FashionStoreCollections = defineCapsule({
  name: 'FashionStoreCollections',
  description:
    'Shop-by-Category collection grid for a minimalist fashion store: a centered eyebrow + serif heading above a responsive 1-to-4 column grid of tall portrait category cards, each a full-bleed image with a darkening scrim that deepens on hover and an overlaid serif category name + piece count. Every card routes through useNavigate and imagery uses the alt-driven Image component. Use to let shoppers browse by department or collection for clothing brands, boutiques, or apparel and accessories shops.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          count: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const collectionsEyebrow = props.eyebrow ?? 'Shop By Category'
    const collectionsHeading = props.heading ?? 'The Collections'
    const collectionItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Outerwear',
            count: '42 pieces',
            imageAlt:
              "Collection of women's outerwear featuring tailored coats and jackets",
          },
          {
            name: 'Knitwear',
            count: '28 pieces',
            imageAlt: 'Collection of premium knitwear sweaters and cardigans',
          },
          {
            name: 'Trousers',
            count: '35 pieces',
            imageAlt: 'Collection of tailored trousers and bottoms',
          },
          {
            name: 'Accessories',
            count: '18 pieces',
            imageAlt:
              'Collection of minimalist accessories including belts and bags',
          },
        ]

    const eyebrowCls =
      'text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'

    return (
      <section
        aria-label="Collection categories"
        className={cn('py-20 lg:py-32', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className={cn(eyebrowCls, 'mb-3')}>{collectionsEyebrow}</p>
            <h2 className="font-serif text-4xl font-normal sm:text-5xl lg:text-6xl">
              {collectionsHeading}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {collectionItems.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => go(c.name)}
                className="group block text-left"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <Image
                    alt={c.imageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-foreground/30" />
                  <div className="absolute bottom-6 left-6 text-background">
                    <p className="mb-1 font-serif text-2xl">{c.name}</p>
                    <p className="text-sm text-background/80">{c.count}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
