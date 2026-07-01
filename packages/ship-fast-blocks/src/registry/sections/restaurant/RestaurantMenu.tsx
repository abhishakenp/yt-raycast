import { defineCapsule } from '#/capsules/openui.ts'
import { useMemo } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  RestaurantMutationSpinner,
  useRestaurantExperience,
  useRestaurantOrder,
  useSyncRestaurantCatalog,
} from './restaurant-interactions.tsx'
import { restaurantLakebed } from './restaurant-lakebed.ts'

/**
 * RestaurantMenu — printed-style multi-course menu for a full-service
 * restaurant page. A centered heading and supporting description sit above a
 * stack of menu categories (e.g. Starters, Mains, Desserts). Each category
 * shows its name with a divider, then lists dishes in a two-column grid. Every
 * dish is a clickable row with a name, optional tag pill (Chef's pick, Vegan,
 * Seasonal), a short description, and a price. Dish rows write shared Lakebed
 * order state so a generated restaurant page behaves like a real interactive
 * ordering surface. Use for restaurants, bistros, trattorias, steakhouses, fine
 * dining, or any sit-down eatery wanting a readable menu section.
 */
export const RestaurantMenu = defineCapsule({
  name: 'RestaurantMenu',
  description:
    "Printed-style multi-course menu for a full-service restaurant page: centered heading and description above a stack of categories (Starters, Mains, Desserts). Each category has a titled divider and a two-column grid of dishes. Every dish is a clickable row with name, optional tag pill (Chef's pick, Vegan, Seasonal), description, and price. Dish rows write shared Lakebed order state and the section shows a live order summary. Use for restaurants, bistros, trattorias, steakhouses, fine dining, or sit-down eateries wanting a readable menu section.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Menu categories, each with a name and a list of dishes. */
    categories: z
      .array(
        z.object({
          name: z.string(),
          items: z.array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
              tag: z.string().optional(),
            }),
          ),
        }),
      )
      .optional(),
    /** Legacy label retained for older generated props; menu clicks now update Lakebed order state. */
    menuTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: restaurantLakebed,
  component: ({ props, lakebed }) => {
    const restaurantOrder = useRestaurantOrder(lakebed)
    const experience = useRestaurantExperience(lakebed)
    const heading = props.heading ?? 'The Menu'
    const description =
      props.description ??
      'Seasonal plates built from local produce and time-honored technique. Served family-style or à la carte.'
    const categories = props.categories?.length
      ? props.categories
      : [
          {
            name: 'Starters',
            items: [
              {
                name: 'Burrata & Heirloom Tomato',
                description:
                  'Creamy burrata, basil oil, aged balsamic, grilled sourdough',
                price: '$16',
                tag: 'Seasonal',
              },
              {
                name: 'Charred Octopus',
                description: 'Smoked paprika, fingerling potatoes, salsa verde',
                price: '$19',
                tag: "Chef's pick",
              },
              {
                name: 'Roasted Beet Salad',
                description: 'Whipped goat cheese, candied walnuts, citrus',
                price: '$14',
                tag: 'Vegan',
              },
              {
                name: 'French Onion Soup',
                description: 'Caramelized onion, Gruyère crouton, beef broth',
                price: '$12',
              },
            ],
          },
          {
            name: 'Mains',
            items: [
              {
                name: 'Dry-Aged Ribeye',
                description:
                  '12oz prime cut, bone marrow butter, hand-cut fries',
                price: '$48',
                tag: "Chef's pick",
              },
              {
                name: 'Pan-Seared Branzino',
                description:
                  'Whole Mediterranean sea bass, lemon caper, fennel',
                price: '$34',
              },
              {
                name: 'Wild Mushroom Risotto',
                description: 'Carnaroli rice, truffle, aged parmesan, chive',
                price: '$26',
                tag: 'Vegan',
              },
              {
                name: 'Braised Short Rib',
                description: 'Red wine reduction, creamy polenta, gremolata',
                price: '$38',
              },
            ],
          },
          {
            name: 'Desserts',
            items: [
              {
                name: 'Dark Chocolate Tart',
                description: 'Sea salt, crème fraîche, cocoa nib tuile',
                price: '$12',
              },
              {
                name: 'Vanilla Bean Panna Cotta',
                description: 'Macerated berries, shortbread crumble',
                price: '$11',
                tag: 'Seasonal',
              },
              {
                name: 'Warm Apple Crostata',
                description: 'Brown butter, cinnamon ice cream, caramel',
                price: '$13',
                tag: "Chef's pick",
              },
            ],
          },
        ]
    const catalogItems = useMemo(
      () =>
        categories.flatMap((category) =>
          (category.items ?? []).map((item) => ({
            category: category.name,
            description: item.description,
            name: item.name,
            price: item.price,
            tag: item.tag,
          })),
        ),
      [categories],
    )

    useSyncRestaurantCatalog(lakebed, catalogItems)

    return (
      <section className={cn('py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-6 font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
            {experience?.selectedMenuItem ? (
              <p
                className="mx-auto mt-4 max-w-xl rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                aria-live="polite"
              >
                Selected {experience.selectedMenuItem}
                {experience.selectedCategory
                  ? ` from ${experience.selectedCategory}`
                  : ''}
              </p>
            ) : null}
            <div
              className="mx-auto mt-6 flex max-w-xl flex-col items-center justify-between gap-3 rounded-full border border-border bg-muted/40 px-5 py-3 text-sm text-muted-foreground sm:flex-row"
              aria-live="polite"
            >
              <span>
                {restaurantOrder.count
                  ? `${restaurantOrder.count} item${restaurantOrder.count === 1 ? '' : 's'} in the table order`
                  : 'Tap dishes to build a live table order.'}
              </span>
              <button
                type="button"
                aria-busy={restaurantOrder.clearPending}
                disabled={
                  !restaurantOrder.count || restaurantOrder.clearPending
                }
                onClick={() => {
                  void restaurantOrder.clear()
                }}
                className="inline-flex h-8 items-center justify-center gap-2 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                {restaurantOrder.clearPending ? (
                  <RestaurantMutationSpinner />
                ) : (
                  'Clear order'
                )}
              </button>
            </div>
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
                    <button
                      key={item.name}
                      type="button"
                      aria-label={`Add ${item.name}`}
                      aria-busy={restaurantOrder.isAdding(item.name)}
                      onClick={() => {
                        void restaurantOrder.add(item.name, {
                          category: category.name,
                          description: item.description,
                          name: item.name,
                          price: item.price,
                          tag: item.tag,
                        })
                      }}
                      className="group flex w-full items-start justify-between gap-4 text-left"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium text-foreground transition-colors group-hover:text-primary">
                            {item.name}
                          </h4>
                          {item.tag ? (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs uppercase tracking-wide text-primary">
                              {item.tag}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-serif text-lg text-foreground">
                          {item.price}
                        </span>
                        <span className="inline-flex min-h-5 items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                          {restaurantOrder.isAdding(item.name) ? (
                            <RestaurantMutationSpinner className="size-3" />
                          ) : restaurantOrder.quantityFor(item.name) ? (
                            `Added ${restaurantOrder.quantityFor(item.name)}`
                          ) : (
                            'Add'
                          )}
                        </span>
                      </span>
                    </button>
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
