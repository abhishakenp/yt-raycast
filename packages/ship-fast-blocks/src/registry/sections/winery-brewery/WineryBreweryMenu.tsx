import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  MenuCategoryHeader,
  MenuCategoryTitle,
  MenuCategoryDivider,
} from '#/section-kit/MenuCategoryHeader.tsx'
import {
  MenuItemRow,
  MenuItemContent,
  MenuItemBody,
  MenuItemNameRow,
  MenuItemName,
  MenuItemTag,
  MenuItemRowDescription,
  MenuItemPriceColumn,
  MenuItemRowPrice,
  MenuItemAction,
} from '#/section-kit/MenuItemRow.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MenuList } from '#/section-kit/MenuList.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
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
      <section className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}>
        <Container size="xl" className="px-6">
          <MenuList>
            <SectionHeading
              title={heading}
              subtitle={description}
              align="center"
              titleClassName="font-serif text-3xl font-medium sm:text-4xl lg:text-5xl"
              className="mx-auto mb-16 max-w-2xl gap-6"
            />

            <div className="space-y-16">
              {categories.map((category) => (
                <div key={category.name}>
                  <MenuCategoryHeader>
                    <MenuCategoryTitle>{category.name}</MenuCategoryTitle>
                    <MenuCategoryDivider />
                  </MenuCategoryHeader>
                  <ResponsiveGrid
                    cols="1-md-2"

                    className="gap-x-12 gap-y-6 gap-0"
                  >
                    {(category.items ?? []).map((item) => (
                      <MenuItemRow>
                        <MenuItemContent>
                          <MenuItemBody>
                            <MenuItemNameRow>
                              <MenuItemName onClick={() => go(menuTarget)}>
                                {item.name}
                              </MenuItemName>
                              <MenuItemTag>{item.tag}</MenuItemTag>
                            </MenuItemNameRow>
                            <MenuItemRowDescription>
                              {item.notes}
                            </MenuItemRowDescription>
                          </MenuItemBody>
                          <MenuItemPriceColumn>
                            <MenuItemRowPrice>{item.price}</MenuItemRowPrice>
                            <MenuItemAction>
                              {
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
                              }
                            </MenuItemAction>
                          </MenuItemPriceColumn>
                        </MenuItemContent>
                      </MenuItemRow>
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
