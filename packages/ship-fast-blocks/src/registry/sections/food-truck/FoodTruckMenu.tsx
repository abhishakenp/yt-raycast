import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
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
import { Watermark } from '#/section-kit/Decor.tsx'
import { MenuList, MenuCategory, MenuItem } from '#/section-kit/MenuList.tsx'
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
 * FoodTruckMenu — a sticker-poster seasonal MENU section for a food-truck / street-food
 * site. Under a giant ghost "MENU" watermark, a mono index eyebrow + extrabold slab
 * heading + intro sits above a 2-up responsive grid of hard-bordered rounded-none menu
 * category slabs (one can span full width), each led by a sharp-bordered category photo
 * carrying a rotated rubber-stamp badge chip, a mono index + slab title, then a
 * collapsed-border ledger of priced items (name + optional dietary stamp tag, description,
 * extrabold tabular price, and a scoped hard-bordered add-to-cart slab with press
 * feedback) split by hairline dividers, with a row of dietary-legend stamp chips beneath.
 * Rows seed shared command search and write to the shared Lakebed cart. Imagery uses the
 * alt-driven Image component. Use as the menu section for food trucks, taco/burger/bowl
 * concepts, cafes or any chef-driven mobile-food brand showing a priced, categorized menu.
 */
export const FoodTruckMenu = defineCapsule({
  name: 'FoodTruckMenu',
  description:
    'Sticker-poster seasonal MENU section for a food-truck / street-food site: under a giant ghost "MENU" watermark, a mono index eyebrow + extrabold slab heading + intro above a 2-up responsive grid of hard-bordered rounded-none menu category slabs (one card can span full width), each led by a sharp-bordered category photo carrying a rotated rubber-stamp badge chip, a mono index + slab title, then a collapsed-border ledger of priced items (name with optional V/VG/GF dietary stamp tag, description, extrabold tabular price, and a scoped hard-bordered add-to-cart slab with press feedback) split by hairline dividers, with a row of dietary-legend stamp chips beneath. Rows seed shared command search and write to the shared Lakebed cart. Imagery uses the alt-driven Image component. Use as the menu section for food trucks, taco / burger / bowl concepts, cafes, delis or any chef-driven mobile-food brand showing a priced, categorized menu.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    categories: z
      .array(
        z.object({
          title: z.string(),
          imageAlt: z.string(),
          badge: z.string().optional(),
          wide: z.boolean().optional(),
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
    legend: z.array(z.string()).optional(),
    /** Label for each row add button. */
    addLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const menuEyebrow = props.eyebrow ?? 'June Menu'
    const menuHeading = props.heading ?? "What's Cooking"
    const menuDesc =
      props.description ??
      "Our menu rotates seasonally. Here's what we're serving this month."
    const menuCategories = props.categories?.length
      ? props.categories
      : [
          {
            title: 'Signature Tacos',
            badge: 'Most Popular',
            imageAlt:
              'Korean short rib tacos with kimchi slaw on corn tortillas',
            items: [
              {
                name: 'Korean Short Rib',
                description:
                  'Braised galbi, kimchi slaw, cilantro, gochujang crema',
                price: '$14',
              },
              {
                name: 'Baja Fish',
                description: 'Crispy cod, cabbage, pico, chipotle aioli (GF)',
                price: '$12',
              },
              {
                name: 'Roasted Cauliflower',
                description:
                  'Tahini dressing, pickled onion, toasted almonds (V, GF)',
                price: '$11',
                tag: 'VG',
              },
              {
                name: 'Carnitas',
                description: 'Slow-braised pork, salsa verde, queso fresco',
                price: '$13',
              },
            ],
          },
          {
            title: 'Bowls & Salads',
            imageAlt:
              'Loaded grain bowl with quinoa, roasted vegetables, and tahini dressing',
            items: [
              {
                name: 'Mediterranean Bowl',
                description:
                  'Quinoa, falafel, hummus, cucumber, tomato, tahini (V)',
                price: '$15',
                tag: 'VG',
              },
              {
                name: 'Poke Bowl',
                description:
                  'Sushi rice, ahi tuna, avocado, edamame, spicy mayo (GF)',
                price: '$16',
              },
              {
                name: 'Grilled Chicken Caesar',
                description:
                  'Romaine, parmesan, sourdough croutons, house dressing',
                price: '$13',
              },
              {
                name: 'Grain Bowl',
                description:
                  'Farro, roasted seasonal veg, lemon herb vinaigrette (V, GF)',
                price: '$14',
                tag: 'VG',
              },
            ],
          },
          {
            title: 'Burgers & Sandwiches',
            wide: true,
            imageAlt:
              'Handheld smash burger with melted cheese and caramelized onions',
            items: [
              {
                name: 'Smash Burger',
                description:
                  'Double patty, american cheese, caramelized onions, special sauce',
                price: '$15',
              },
              {
                name: 'Fried Chicken Sandwich',
                description: 'Buttermilk brined, pickles, slaw, spicy honey',
                price: '$14',
              },
              {
                name: 'Grilled Cheese',
                description:
                  'Sourdough, aged cheddar, gruyere, tomato soup dip',
                price: '$11',
                tag: 'V',
              },
              {
                name: 'BLT',
                description:
                  'Thick-cut bacon, heirloom tomato, butter lettuce, aioli',
                price: '$13',
              },
            ],
          },
          {
            title: 'Sides & Sweets',
            imageAlt: 'Assorted cookies and brownies on a rustic wooden board',
            items: [
              {
                name: 'Truffle Fries',
                description: 'Parmesan, truffle oil, herbs (V)',
                price: '$6',
              },
              {
                name: 'Street Corn',
                description: 'Elote style, cotija, chili, lime (V, GF)',
                price: '$5',
              },
              {
                name: 'Daily Cookie',
                description: 'Baked fresh each morning (V option)',
                price: '$4',
              },
            ],
          },
        ]
    const menuLegend = props.legend?.length
      ? props.legend
      : ['VG = Vegan', 'V = Vegetarian', 'GF = Gluten-Free']
    const addLabel = props.addLabel ?? 'Add'
    const allMenuItems = menuCategories.flatMap((category) =>
      category.items.map((item) => ({ ...item, category: category.title })),
    )

    useSyncCommerceCatalog(
      lakebed,
      allMenuItems.map((item) =>
        commerceProduct({
          imageAlt: item.name,
          label: item.name,
          price: item.price,
          subtitle: item.tag ? `${item.category} · ${item.tag}` : item.category,
        }),
      ),
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden px-6 pt-24 pb-20',
          props.className,
        )}
      >
        <Watermark className="-left-6 top-4 text-[7rem] sm:text-[12rem] lg:text-[17rem]">
          MENU
        </Watermark>
        <Container size="lg" className="relative">
          <MenuList>
            <SectionHeading
              eyebrow={`01 / ${menuEyebrow}`}
              title={menuHeading}
              subtitle={menuDesc}
              align="left"
              eyebrowClassName="font-mono uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="text-4xl font-extrabold tracking-tighter md:text-5xl"
              subtitleClassName="max-w-lg"
              className="mb-12 items-start text-left"
            />

            <ResponsiveGrid cols="1-md-2">
              {menuCategories.map((cat, ci) => (
                <MenuCategory asChild key={cat.title}>
                  <div
                    key={cat.title}
                    className={cn(
                      'border-2 border-foreground bg-card p-5 sm:p-6',
                      cat.wide && 'md:col-span-2',
                    )}
                  >
                    <div className="relative mb-5">
                      <Image
                        alt={cat.imageAlt}
                        w={800}
                        h={400}
                        loading="lazy"
                        className={cn(
                          'w-full rounded-none border-2 border-foreground object-cover',
                          cat.wide ? 'h-48' : 'h-56',
                        )}
                      />
                      {cat.badge && (
                        <span className="absolute -right-2 -top-3 rotate-3 rounded-full border-2 border-foreground bg-primary px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground">
                          {cat.badge}
                        </span>
                      )}
                    </div>
                    <div className="mb-4 flex items-baseline gap-3">
                      <span
                        aria-hidden="true"
                        className="font-mono text-sm font-bold tabular-nums text-muted-foreground"
                      >
                        {String(ci + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-2xl font-extrabold tracking-tight">
                        {cat.title}
                      </h3>
                    </div>
                    <div
                      className={cn(
                        cat.wide ? 'grid gap-x-8 sm:grid-cols-2' : '',
                      )}
                    >
                      {(cat.items ?? []).map((item, i) => (
                        <MenuItem asChild key={item.name}>
                          <MenuItemRow
                            className={cn(
                              'py-4',
                              i < cat.items.length - 1 &&
                                'border-b-2 border-dashed border-foreground/20',
                            )}
                          >
                            <MenuItemContent>
                              <MenuItemBody>
                                <MenuItemNameRow>
                                  <MenuItemName className="font-bold">
                                    {item.name}
                                  </MenuItemName>
                                  <MenuItemTag className="rounded-full border border-foreground bg-transparent px-1.5 py-0 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-foreground">
                                    {item.tag}
                                  </MenuItemTag>
                                </MenuItemNameRow>
                                <MenuItemRowDescription>
                                  {item.description}
                                </MenuItemRowDescription>
                              </MenuItemBody>
                              <MenuItemPriceColumn>
                                <MenuItemRowPrice className="font-sans text-lg font-extrabold tabular-nums">
                                  {item.price}
                                </MenuItemRowPrice>
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
                                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-none border-2 border-foreground bg-background px-3 font-mono text-xs font-bold uppercase tracking-wide text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0] hover:shadow-foreground active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                                    >
                                      {addLabel}
                                    </CommerceAddItemButton>
                                  }
                                </MenuItemAction>
                              </MenuItemPriceColumn>
                            </MenuItemContent>
                          </MenuItemRow>
                        </MenuItem>
                      ))}
                    </div>
                  </div>
                </MenuCategory>
              ))}
            </ResponsiveGrid>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {menuLegend.map((entry) => (
                <span
                  key={entry}
                  className="inline-block rounded-full border-2 border-foreground bg-background px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-foreground"
                >
                  {entry}
                </span>
              ))}
            </div>
          </MenuList>
        </Container>
      </section>
    )
  },
})
