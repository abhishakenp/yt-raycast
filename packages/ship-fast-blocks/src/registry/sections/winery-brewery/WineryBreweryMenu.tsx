import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * WineryBreweryMenu — printed-style tasting list for a winery or craft brewery
 * page. A centered serif heading and supporting description sit above a stack
 * of categories (e.g. Reds, Whites, Seasonal Ales). Each category shows its
 * name with a divider, then lists pours in a two-column grid. Every pour seeds
 * shared command search and includes a scoped add-to-cart control that writes to
 * the shared Lakebed cart, while the item name still routes through useNavigate
 * to a visit or tasting-booking target. Use for wineries, vineyards, cellar
 * doors, breweries, taprooms, or cideries that want a readable,
 * conversion-focused tasting menu.
 */
export const WineryBreweryMenu = defineCapsule({
  name: 'WineryBreweryMenu',
  description:
    'Printed-style tasting list for a winery or craft brewery page: centered serif heading and description above a stack of categories (Reds, Whites, Seasonal Ales). Each category has a titled divider and a two-column grid of pours. Every pour seeds shared command search and has a scoped add-to-cart control that writes to the shared Lakebed cart; the item name still routes through useNavigate. Use for wineries, vineyards, cellar doors, breweries, taprooms, or cideries wanting a readable tasting menu.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Tasting categories, each with a name and a list of pours. */
    categories: z
      .array(
        z.object({
          name: z.string(),
          items: z.array(
            z.object({
              name: z.string(),
              notes: z.string(),
              price: z.string(),
              tag: z.string().optional(),
            }),
          ),
        }),
      )
      .optional(),
    /** Navigation target when a tasting row is clicked. */
    menuTarget: z.string().optional(),
    /** Label for each row add button. */
    addLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Tasting List'
    const description =
      props.description ??
      'Pours from our estate vineyard and small-batch brewhouse, each grown, fermented, and aged on the property. Available by the glass or as a guided flight.'
    const menuTarget = props.menuTarget ?? 'Visit'
    const categories = props.categories?.length
      ? props.categories
      : [
          {
            name: 'Reds',
            items: [
              {
                name: 'Old-Vine Zinfandel',
                notes:
                  'Brambly blackberry, cracked pepper, and a warm vanilla-oak finish',
                price: '$14',
                tag: 'Estate',
              },
              {
                name: 'Hillside Cabernet',
                notes:
                  'Dark cherry, cedar, fine-grained tannins, long cellar life',
                price: '$18',
                tag: 'Award',
              },
              {
                name: 'Barrel-Select Syrah',
                notes: 'Plum, smoked meat, violet, and crushed stone',
                price: '$16',
              },
              {
                name: 'Grenache Reserve',
                notes: 'Wild strawberry, white pepper, garrigue herbs',
                price: '$15',
                tag: 'Limited',
              },
            ],
          },
          {
            name: 'Whites & Rosé',
            items: [
              {
                name: 'Cellar Chardonnay',
                notes: 'Meyer lemon, toasted hazelnut, a whisper of butter',
                price: '$13',
                tag: 'Estate',
              },
              {
                name: 'Dry Sauvignon Blanc',
                notes: 'Grapefruit, fresh-cut grass, crisp mineral snap',
                price: '$12',
              },
              {
                name: 'Hillside Rosé',
                notes: 'Watermelon, rose petal, bright citrus, bone dry',
                price: '$12',
                tag: 'Seasonal',
              },
            ],
          },
          {
            name: 'Seasonal Ales',
            items: [
              {
                name: 'Harvest Saison',
                notes: 'Farmhouse spice, ripe pear, a peppery dry finish',
                price: '$9',
                tag: 'Limited',
              },
              {
                name: 'Barrel-Aged Stout',
                notes: 'Dark chocolate, espresso, oak, and toasted coconut',
                price: '$11',
                tag: 'Award',
              },
              {
                name: 'Estate Hopped IPA',
                notes: 'Pine, grapefruit zest, and a soft cracker malt base',
                price: '$9',
              },
            ],
          },
        ]
    const addLabel = props.addLabel ?? 'Add'
    const allPours = categories.flatMap((category) =>
      category.items.map((item) => ({ ...item, category: category.name })),
    )

    useSyncCommerceCatalog(
      lakebed,
      allPours.map((item) =>
        commerceProduct({
          imageAlt: item.name,
          label: item.name,
          price: item.price,
          subtitle: item.tag ? `${item.category} · ${item.tag}` : item.category,
        }),
      ),
    )

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-6 font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-16">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="mb-8 flex items-center gap-4">
                  <h3 className="font-serif text-2xl font-medium text-foreground">
                    {category.name}
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                  {(category.items ?? []).map((item) => (
                    <div
                      key={item.name}
                      className="group flex w-full items-start justify-between gap-4 text-left"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => go(menuTarget)}
                            className="font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {item.name}
                          </button>
                          {item.tag ? (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs uppercase tracking-wide text-primary">
                              {item.tag}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.notes}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="font-serif text-lg text-foreground">
                          {item.price}
                        </span>
                        <CommerceAddItemButton
                          lakebed={lakebed}
                          item={{
                            label: item.name,
                            price: item.price,
                          }}
                          aria-label={`${addLabel} ${item.name} to cart`}
                          pendingChildren={
                            <>
                              <CommerceMutationSpinner className="size-3" />
                              Adding
                            </>
                          }
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-70"
                        >
                          {addLabel}
                        </CommerceAddItemButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
