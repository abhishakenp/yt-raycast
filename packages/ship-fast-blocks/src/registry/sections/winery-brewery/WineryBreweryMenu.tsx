import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
  MenuItemRowPrice,
  MenuItemAction,
} from '#/section-kit/MenuItemRow.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MenuList } from '#/section-kit/MenuList.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * WineryBreweryMenu — artisan-editorial tasting ledger for a winery or craft
 * brewery page. A left-aligned mono meta rail and serif heading sit above a
 * giant faint ghost watermark, then a stack of categories (Reds, Whites,
 * Seasonal Ales). Each category header pairs a serif title with a rotated
 * mono label-stamp and a hairline divider; below it, pours read as
 * collapsed-border tasting-ledger rows — a serif pour name, an optional
 * label-stamp tag, a dotted price leader, and a tabular mono price
 * (PINOT NOIR ···· $14) — with mono tasting notes beneath and a square-edged
 * add-to-cart control. Every pour seeds shared command search and its add
 * button writes to the shared Lakebed cart, while the pour name still routes
 * through section-kit route links to a visit or tasting-booking target. Use for
 * wineries, vineyards, cellar doors, breweries, taprooms, or cideries wanting a
 * readable, conversion-focused tasting menu.
 */
export const WineryBreweryMenu = defineCapsule({
  name: 'WineryBreweryMenu',
  description:
    'Artisan-editorial tasting ledger for a winery or craft brewery page: a left-aligned mono meta rail and serif heading above a giant faint ghost watermark, then a stack of categories (Reds, Whites, Seasonal Ales). Each category header pairs a serif title with a rotated mono label-stamp and a hairline divider; pours read as collapsed-border tasting-ledger rows (serif name, optional label-stamp tag, dotted price leader, tabular mono price) with mono notes and a square add-to-cart control. Every pour seeds shared command search and its add button writes to the shared Lakebed cart; the pour name still routes through section-kit route links. Use for wineries, vineyards, cellar doors, breweries, taprooms, or cideries wanting a readable tasting menu.',
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
      <section
        className={cn(
          'relative overflow-hidden pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-top-6 right-0 font-serif text-[7rem] font-medium italic sm:text-[11rem] lg:text-[15rem]">
          Cellar
        </Watermark>

        <Container size="xl" className="relative px-6">
          <MenuList>
            <div className="mb-10 flex items-center gap-4">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 bg-primary"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                By the glass · By the flight
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>

            <SectionHeading
              title={heading}
              subtitle={description}
              align="left"
              titleClassName="font-serif text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl"
              className="mb-14 max-w-2xl gap-5"
            />

            <div className="space-y-14">
              {categories.map((category) => (
                <div key={category.name}>
                  <MenuCategoryHeader className="mb-6 gap-4">
                    <MenuCategoryTitle className="tracking-tight">
                      {category.name}
                    </MenuCategoryTitle>
                    <span className="inline-flex -rotate-2 items-center whitespace-nowrap border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {String((category.items ?? []).length).padStart(2, '0')}{' '}
                      pours
                    </span>
                    <MenuCategoryDivider />
                  </MenuCategoryHeader>
                  <ResponsiveGrid cols="1-md-2" className="gap-y-0 gap-x-16">
                    {(category.items ?? []).map((item) => (
                      <MenuItemRow
                        key={`${category.name}:${item.name}`}
                        className="group border-b border-border/70 py-5"
                      >
                        <MenuItemContent className="flex-col items-stretch gap-2">
                          <MenuItemBody className="flex flex-col gap-2">
                            <MenuItemNameRow className="items-baseline gap-3">
                              <MenuItemName
                                asChild
                                className="font-serif text-lg font-medium text-foreground transition-colors hover:text-primary"
                              >
                                <NavbarRouteLink href={menuTarget}>
                                  {item.name}
                                </NavbarRouteLink>
                              </MenuItemName>
                              {item.tag ? (
                                <MenuItemTag className="rounded-none border border-border bg-transparent px-1.5 py-0.5 font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-muted-foreground">
                                  {item.tag}
                                </MenuItemTag>
                              ) : null}
                              <span
                                aria-hidden="true"
                                className="mb-1.5 hidden h-px flex-1 self-end border-b border-dotted border-border sm:block"
                              />
                              <MenuItemRowPrice className="font-mono text-base font-medium tabular-nums text-foreground">
                                {item.price}
                              </MenuItemRowPrice>
                            </MenuItemNameRow>
                            <MenuItemRowDescription className="max-w-md text-sm leading-relaxed text-muted-foreground">
                              {item.notes}
                            </MenuItemRowDescription>
                          </MenuItemBody>
                          <MenuItemAction className="mt-1">
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
                              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-none border border-border bg-background px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground transition-[transform,background-color,color] duration-150 hover:bg-primary hover:text-primary-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                            >
                              {addLabel}
                            </CommerceAddItemButton>
                          </MenuItemAction>
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
