import { defineCapsule } from '#/capsules/openui.ts'
import { useMemo } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  MenuCategoryHeader,
  MenuCategoryTitle,
  MenuCategoryDivider,
} from '#/section-kit/MenuCategoryHeader.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MenuList } from '#/section-kit/MenuList.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  RestaurantMutationSpinner,
  useRestaurantExperience,
  useRestaurantOrder,
  useSyncRestaurantCatalog,
} from './restaurant-interactions.tsx'
import { restaurantLakebed } from './restaurant-lakebed.ts'

/**
 * RestaurantMenu — ledger-typeset multi-course menu for a full-service
 * restaurant page. A left-aligned mono eyebrow and warm serif heading sit
 * over a giant faint "MENU" ghost watermark, with a hairline-bordered live
 * order strip beneath. Menu categories (e.g. Starters, Mains, Desserts) each
 * open with a mono index numeral, a serif category title, and a hairline rule,
 * then list dishes as classic collapsed-border ledger rows — dish name, a
 * dotted leader that stretches to a tabular-nums price — in a two-column grid.
 * Every dish is a clickable row with an optional rotated hairline "stamp" tag
 * (Chef's pick, Vegan, Seasonal), a short description, and a square Add badge.
 * Dish rows write shared Lakebed order state so a generated restaurant page
 * behaves like a real interactive ordering surface. Use for restaurants,
 * bistros, trattorias, steakhouses, fine dining, or any sit-down eatery wanting
 * a readable menu section.
 */
export const RestaurantMenu = defineCapsule({
  name: 'RestaurantMenu',
  description:
    "Ledger-typeset multi-course menu for a full-service restaurant page: a left-aligned mono eyebrow and warm serif heading over a giant faint 'MENU' ghost watermark, with a hairline-bordered live order strip beneath. Menu categories (Starters, Mains, Desserts) each open with a mono index numeral, serif title, and hairline rule, then list dishes as collapsed-border ledger rows — dish name, a dotted leader stretching to a tabular-nums price — in a two-column grid. Every dish is a clickable row with an optional rotated hairline 'stamp' tag (Chef's pick, Vegan, Seasonal), a description, and a square Add badge. Dish rows write shared Lakebed order state and the section shows a live order summary. Use for restaurants, bistros, trattorias, steakhouses, fine dining, or sit-down eateries wanting a readable menu section.",
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
      <section
        className={cn(
          'relative overflow-hidden py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-8 text-[7rem] leading-none sm:text-[12rem] lg:text-[16rem]">
          MENU
        </Watermark>
        <Container size="xl" className="relative px-6">
          <MenuList>
            <div className="mb-12 max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                La Carte
              </span>
              <SectionHeading
                title={heading}
                subtitle={description}
                align="left"
                titleClassName="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl"
                subtitleClassName="text-muted-foreground"
                className="gap-4"
              />
              {experience?.selectedMenuItem ? (
                <p
                  className="mt-5 inline-flex rotate-[-1deg] items-center border border-primary/40 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-primary"
                  aria-live="polite"
                >
                  Selected {experience.selectedMenuItem}
                  {experience.selectedCategory
                    ? ` from ${experience.selectedCategory}`
                    : ''}
                </p>
              ) : null}
              <div
                className="mt-6 flex flex-col items-start justify-between gap-3 border-y border-foreground/15 bg-muted/30 px-5 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center"
                aria-live="polite"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
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
                  className="inline-flex h-8 items-center justify-center gap-2 rounded-none border border-foreground/25 bg-background px-3 text-xs font-medium text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
                >
                  {restaurantOrder.clearPending ? (
                    <RestaurantMutationSpinner />
                  ) : (
                    'Clear order'
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-14">
              {categories.map((category, ci) => (
                <div key={category.name}>
                  <MenuCategoryHeader className="mb-6 gap-4">
                    <span
                      aria-hidden="true"
                      className="font-mono text-xs tabular-nums tracking-[0.2em] text-primary"
                    >
                      {String(ci + 1).padStart(2, '0')}
                    </span>
                    <MenuCategoryTitle className="tracking-tight">
                      {category.name}
                    </MenuCategoryTitle>
                    <MenuCategoryDivider className="bg-foreground/15" />
                    <span
                      aria-hidden="true"
                      className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70"
                    >
                      {String((category.items ?? []).length).padStart(2, '0')}
                    </span>
                  </MenuCategoryHeader>
                  <ResponsiveGrid
                    cols="1-md-2"
                    className="gap-x-12 gap-y-0 gap-0"
                  >
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
                        className="group block w-full border-b border-foreground/12 py-4 text-left transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-baseline gap-3">
                          <h4 className="font-serif text-lg text-foreground transition-colors group-hover:text-primary">
                            {item.name}
                          </h4>
                          <span
                            aria-hidden="true"
                            className="mb-1 h-0 flex-1 border-b border-dotted border-foreground/25"
                          />
                          <span className="font-serif text-lg tabular-nums text-foreground">
                            {item.price}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-start justify-between gap-4">
                          <p className="text-sm text-muted-foreground">
                            {item.tag ? (
                              <span className="mr-2 inline-flex rotate-[-2deg] items-center border border-foreground/30 px-1.5 py-0.5 align-middle font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/70">
                                {item.tag}
                              </span>
                            ) : null}
                            {item.description}
                          </p>
                          <span className="inline-flex min-h-5 shrink-0 items-center rounded-none border border-transparent bg-muted px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary">
                            {restaurantOrder.isAdding(item.name) ? (
                              <RestaurantMutationSpinner className="size-3" />
                            ) : restaurantOrder.quantityFor(item.name) ? (
                              `Added ${restaurantOrder.quantityFor(item.name)}`
                            ) : (
                              'Add'
                            )}
                          </span>
                        </div>
                      </button>
                    ))}
                  </ResponsiveGrid>
                </div>
              ))}
            </div>
          </MenuList>
        </Container>
      </section>
    )
  },
})
