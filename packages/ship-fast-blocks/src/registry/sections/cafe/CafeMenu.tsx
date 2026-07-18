import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  MenuCategoryHeader,
  MenuCategoryIcon,
  MenuCategoryTitle,
} from '#/section-kit/MenuCategoryHeader.tsx'
import {
  MenuItemRow,
  MenuItemContent,
  MenuItemBody,
  MenuItemNameRow,
  MenuItemName,
  MenuItemRowDescription,
  MenuItemPriceColumn,
  MenuItemRowPrice,
  MenuItemAction,
} from '#/section-kit/MenuItemRow.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  MenuList,
  MenuItemDescription,
  MenuItemPrice,
} from '#/section-kit/MenuList.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * CafeMenu — printed-style food and drink menu for a neighborhood cafe /
 * coffee shop page. A centered cap / heading / description above a two-column
 * grid: the left column lists coffee drinks, the right lists pastries and light
 * fare. Each item is a live add-to-cart row with a name, description, and price
 * separated by a border divider. Below the two-column grid, a teas and
 * non-coffee band shows four centered cards. Rows seed the shared product
 * command search catalog and add into the shared Lakebed cart used by the cafe
 * navigation. Use for cafes, bakeries, tea houses, brunch spots, or any
 * cozy eatery wanting a readable, conversion-focused menu section. Renders
 * fully with no props via baked-in defaults.
 */
export const CafeMenu = defineCapsule({
  name: 'CafeMenu',
  description:
    'Printed-style food and drink menu for a cozy cafe page: centered cap, heading, and description above a two-column grid of coffee drinks and pastries/light fare. Each item is a live add-to-cart row with name, description, price, and a scoped loading button. Below, a teas and non-coffee band shows four centered cards. Rows seed the shared product command search catalog and mutate the shared Lakebed cart used by cafe navigation. Use for cafes, bakeries, tea houses, brunch spots, or cozy eateries wanting a readable menu section.',
  props: z.object({
    /** Eyebrow / cap text above the heading. */
    cap: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Coffee column title. */
    coffeeTitle: z.string().optional(),
    /** Coffee menu items. */
    coffee: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    /** Food column title. */
    foodTitle: z.string().optional(),
    /** Food / pastry menu items. */
    food: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    /** Teas band title. */
    teaTitle: z.string().optional(),
    /** Tea and non-coffee items. */
    teas: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    /** Navigation target when a menu item is clicked. */
    menuTarget: z.string().optional(),
    /** Label for each row add button. */
    addLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const cap = props.cap ?? 'Our Offerings'
    const heading = props.heading ?? 'Crafted with intention'
    const description =
      props.description ??
      'Every drink is made to order with precision. Every pastry is baked fresh before sunrise.'
    const coffeeTitle = props.coffeeTitle ?? 'Coffee'
    const coffee = props.coffee?.length
      ? props.coffee
      : [
          {
            name: 'Espresso',
            description: 'Double shot, rich crema, served demitasse',
            price: '$3.50',
          },
          {
            name: 'House Drip',
            description: 'Rotating single origin, batch brewed',
            price: '$3.00',
          },
          {
            name: 'Cappuccino',
            description: 'Equal parts espresso, steamed milk, microfoam',
            price: '$4.50',
          },
          {
            name: 'Latte',
            description: 'Espresso with silky steamed milk',
            price: '$5.00',
          },
          {
            name: 'Oat Flat White',
            description: 'Double ristretto, Oatly barista blend',
            price: '$5.50',
          },
          {
            name: 'Pour Over',
            description: 'V60 or Chemex, rotating seasonal beans',
            price: '$5.00',
          },
          {
            name: 'Cold Brew',
            description: 'Steeped 18 hours, smooth and strong',
            price: '$4.50',
          },
          {
            name: 'Nitro Cold Brew',
            description: 'Nitrogen-infused, creamy texture',
            price: '$5.50',
          },
          {
            name: 'Americano',
            description: 'Double espresso, hot water',
            price: '$3.75',
          },
          {
            name: 'Mocha',
            description: 'Espresso, house chocolate, steamed milk',
            price: '$5.50',
          },
        ]
    const foodTitle = props.foodTitle ?? 'Pastries & Light Fare'
    const food = props.food?.length
      ? props.food
      : [
          {
            name: 'Butter Croissant',
            description: 'Flaky layers, French butter, baked fresh',
            price: '$4.25',
          },
          {
            name: 'Almond Croissant',
            description:
              'Filled with house almond cream, topped with sliced almonds',
            price: '$5.00',
          },
          {
            name: 'Morning Bun',
            description: 'Orange zest, cinnamon sugar, brioche dough',
            price: '$4.50',
          },
          {
            name: 'Sourdough Toast',
            description: "Ken's Artisan sourdough, cultured butter, sea salt",
            price: '$4.00',
          },
          {
            name: 'Avocado Toast',
            description: 'Sourdough, smashed avocado, radish, chili flakes',
            price: '$9.50',
          },
          {
            name: 'Seasonal Scone',
            description: 'Current: Blueberry lemon with glaze',
            price: '$4.00',
          },
          {
            name: 'Cardamom Bun',
            description: 'Swedish-style, caramelized cardamom sugar',
            price: '$4.75',
          },
          {
            name: 'Chocolate Chip Cookie',
            description: 'Tahini, brown butter, Maldon sea salt',
            price: '$3.50',
          },
          {
            name: 'Quiche Lorraine',
            description: 'Bacon, Gruyère, all-butter crust',
            price: '$8.50',
          },
          {
            name: 'Granola Bowl',
            description: 'House granola, Greek yogurt, seasonal fruit, honey',
            price: '$7.50',
          },
        ]
    const teaTitle = props.teaTitle ?? 'Teas & Non-Coffee'
    const teas = props.teas?.length
      ? props.teas
      : [
          {
            name: 'Matcha Latte',
            description: 'Ceremonial grade, oat milk',
            price: '$5.50',
          },
          {
            name: 'Chai Latte',
            description: 'House spice blend, steamed milk',
            price: '$5.00',
          },
          {
            name: 'Earl Grey',
            description: 'Loose leaf, bergamot forward',
            price: '$3.50',
          },
          {
            name: 'House Kombucha',
            description: 'Rotating flavor, locally brewed',
            price: '$4.50',
          },
        ]
    const menuTarget = props.menuTarget ?? 'View Menu'
    const addLabel = props.addLabel ?? 'Add'
    const allMenuItems = [
      ...coffee.map((item) => ({ ...item, category: coffeeTitle })),
      ...food.map((item) => ({ ...item, category: foodTitle })),
      ...teas.map((item) => ({ ...item, category: teaTitle })),
    ]

    useSyncCommerceCatalog(
      lakebed,
      allMenuItems.map((item) =>
        commerceProduct({
          imageAlt: item.name,
          label: item.name,
          price: item.price,
          subtitle: item.category,
        }),
      ),
    )

    const MenuAddButton = ({
      item,
    }: {
      item?: { name: string; price: string }
    }) => (
      <CommerceAddItemButton
        lakebed={lakebed}
        item={{
          label: item?.name ?? '',
          price: item?.price ?? '',
        }}
        aria-label={`${addLabel} ${item?.name ?? ''} to cart`}
        pendingChildren={
          <>
            <CommerceMutationSpinner className="size-3" />
            Adding
          </>
        }
        className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-70"
      >
        {addLabel}
      </CommerceAddItemButton>
    )

    return (
      <section className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <MenuList>
            <SectionHeading
              eyebrow={cap}
              title={heading}
              subtitle={description}
              align="center"
              eyebrowClassName="text-primary tracking-wider"
              titleClassName="mb-6 font-serif text-3xl font-medium sm:text-4xl lg:text-5xl"
              className="mx-auto mb-16 max-w-2xl gap-6"
            />

            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              {[
                { title: coffeeTitle, items: coffee },
                { title: foodTitle, items: food },
              ].map((col) => (
                <div key={col.title} className="space-y-8">
                  <MenuCategoryHeader>
                    <MenuCategoryIcon>
                      {
                        <svg
                          className="size-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 2.829a4.978 4.978 0 01-1.414-2.83M6 12a6 6 0 0112 0v1H6v-1z"
                          />
                        </svg>
                      }
                    </MenuCategoryIcon>
                    <MenuCategoryTitle>{col.title}</MenuCategoryTitle>
                  </MenuCategoryHeader>
                  <div className="space-y-6">
                    {(col.items ?? []).map((item) => (
                      <MenuItemRow>
                        <MenuItemContent>
                          <MenuItemBody>
                            <MenuItemNameRow>
                              <MenuItemName onClick={() => go(menuTarget)}>
                                {item.name}
                              </MenuItemName>
                            </MenuItemNameRow>
                            <MenuItemRowDescription>
                              {item.description}
                            </MenuItemRowDescription>
                          </MenuItemBody>
                          <MenuItemPriceColumn>
                            <MenuItemRowPrice>{item.price}</MenuItemRowPrice>
                            <MenuItemAction>
                              {<MenuAddButton item={item} />}
                            </MenuItemAction>
                          </MenuItemPriceColumn>
                        </MenuItemContent>
                      </MenuItemRow>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Teas & Non-Coffee */}
            <div className="mt-16 border-t border-border pt-16">
              <h3 className="mb-8 text-center font-serif text-xl font-medium text-foreground">
                {teaTitle}
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {teas.map((tea) => (
                  <div
                    key={tea.name}
                    className="rounded-xl bg-muted p-6 text-center"
                  >
                    <h4 className="mb-1 font-medium text-foreground">
                      {tea.name}
                    </h4>
                    <MenuItemDescription className="mb-2">
                      {tea.description}
                    </MenuItemDescription>
                    <MenuItemPrice>{tea.price}</MenuItemPrice>
                    <div className="mt-4 flex justify-center">
                      <MenuAddButton item={tea} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MenuList>
        </div>
      </section>
    )
  },
})
