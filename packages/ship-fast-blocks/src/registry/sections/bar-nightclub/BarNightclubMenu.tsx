import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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
  MenuItemRowDescription,
  MenuItemPriceColumn,
  MenuItemRowPrice,
  MenuItemAction,
} from '#/section-kit/MenuItemRow.tsx'
import { MenuList } from '#/section-kit/MenuList.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * BarNightclubMenu — two-column drinks menu for a cocktail-bar / nightclub
 * page. A centered eyebrow + light-weight heading + lead, then a responsive
 * two-column grid of named menu sections (e.g. house signatures / classics &
 * premium); each column has an underlined uppercase header and a list of items
 * showing a name, muted description, right-aligned price, and scoped
 * add-to-cart control that writes to the shared Lakebed cart. Rows seed command
 * search, and the footnote link still routes through section-kit route links. Use to
 * present a cocktail / drinks list for bars, lounges, speakeasies, or
 * restaurants.
 */
export const BarNightclubMenu = defineCapsule({
  name: 'BarNightclubMenu',
  description:
    'Two-column drinks menu for a cocktail-bar / nightclub page: a centered eyebrow, light-weight heading and lead, then a responsive two-column grid of named menu sections (such as house signatures and classics & premium), each with an underlined uppercase header and a list of items showing a name, muted description, right-aligned price, and scoped add-to-cart control that writes to the shared Lakebed cart. Rows seed command search. Closes with a bordered footnote panel and a routable download-menu link. Editorial, monochrome and hairline-bordered. Use to present a cocktail / drinks list for bars, lounges, speakeasies, or restaurants.',
  props: z.object({
    /** Wide letter-spaced uppercase eyebrow. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Menu columns, each a titled list of drinks. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          items: z
            .array(
              z.object({
                name: z.string(),
                description: z.string(),
                price: z.string(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
    /** Footnote text in the closing panel. */
    footnote: z.string().optional(),
    /** Routable footnote link label (e.g. download full menu). */
    footnoteCta: z.string().optional(),
    /** Label for each row add button. */
    addLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Drinks Menu'
    const heading = props.heading ?? 'Signature Cocktails'
    const description =
      props.description ??
      'Handcrafted by our award-winning mixologists. All cocktails available as non-alcoholic upon request.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'House Signatures',
            items: [
              {
                name: 'Midnight in Paris',
                description:
                  "Hendrick's Gin, St-Germain, blackberries, lemon, champagne float",
                price: '$18',
              },
              {
                name: 'Smoke & Mirrors',
                description:
                  'Mezcal, Aperol, smoked honey, grapefruit, habanero bitters',
                price: '$19',
              },
              {
                name: 'Velvet Underground',
                description:
                  'Bourbon, Amaro Nonino, velvet falernum, aromatic bitters',
                price: '$17',
              },
              {
                name: 'Neon Nights',
                description:
                  'Vodka, blue curaçao, coconut, lime, activated charcoal',
                price: '$16',
              },
              {
                name: 'The Nocturnal',
                description:
                  'Rye whiskey, coffee liqueur, cold brew, orange peel',
                price: '$18',
              },
              {
                name: 'Golden Hour',
                description:
                  'Tequila reposado, passion fruit, turmeric, ginger beer',
                price: '$17',
              },
            ],
          },
          {
            title: 'Classics & Premium',
            items: [
              {
                name: 'NOIR Old Fashioned',
                description:
                  'Woodford Reserve, house bitters, demerara, expressed orange',
                price: '$16',
              },
              {
                name: 'Perfect Manhattan',
                description:
                  'Rittenhouse Rye, Carpano Antica, Dolin Dry, Luxardo cherry',
                price: '$17',
              },
              {
                name: 'French 75',
                description: 'Plymouth Gin, lemon, simple syrup, Champagne',
                price: '$15',
              },
              {
                name: 'Negroni Sbagliato',
                description:
                  'Campari, sweet vermouth, Prosecco (bubbly Negroni)',
                price: '$15',
              },
              {
                name: 'Premium Whiskey Flight',
                description:
                  "1oz pours: Yamazaki 12, Macallan 18, Blanton's Single Barrel",
                price: '$45',
              },
              {
                name: 'Champagne by the Glass',
                description:
                  'Dom Pérignon 2013, Krug Grande Cuvée, Veuve Clicquot',
                price: '$28-85',
              },
            ],
          },
        ]
    const footnote =
      props.footnote ??
      'Full menu includes beer, wine, and non-alcoholic options'
    const footnoteCta = props.footnoteCta ?? 'Download Full Menu (PDF)'
    const addLabel = props.addLabel ?? 'Add'
    const allDrinks = columns.flatMap((column) =>
      (column.items ?? []).map((item) => ({ ...item, category: column.title })),
    )

    useSyncCommerceCatalog(
      lakebed,
      allDrinks.map((drink) =>
        commerceProduct({
          imageAlt: drink.name,
          label: drink.name,
          price: drink.price,
          subtitle: drink.category,
        }),
      ),
    )

    return (
      <section
        className={cn(
          'border-t border-border pt-28 pb-24 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <MenuList>
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="mb-16 max-w-2xl gap-0"
              eyebrowClassName="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-6 text-3xl font-light sm:text-4xl lg:text-5xl"
              subtitleClassName="leading-relaxed text-muted-foreground"
            />

            <ResponsiveGrid cols="1-md-2" className="lg:gap-16 gap-12">
              {columns.map((col) => (
                <div key={col.title}>
                  <MenuCategoryHeader className="mb-8">
                    <MenuCategoryTitle className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                      {col.title}
                    </MenuCategoryTitle>
                    <MenuCategoryDivider />
                  </MenuCategoryHeader>
                  <div className="space-y-6">
                    {(col.items ?? []).map((drink) => (
                      <MenuItemRow key={`${col.title}:${drink.name}`}>
                        <MenuItemContent>
                          <MenuItemBody>
                            <MenuItemNameRow>
                              <MenuItemName>{drink.name}</MenuItemName>
                            </MenuItemNameRow>
                            <MenuItemRowDescription>
                              {drink.description}
                            </MenuItemRowDescription>
                          </MenuItemBody>
                          <MenuItemPriceColumn>
                            <MenuItemRowPrice className="whitespace-nowrap text-muted-foreground">
                              {drink.price}
                            </MenuItemRowPrice>
                            <MenuItemAction>
                              {
                                <CommerceAddItemButton
                                  lakebed={lakebed}
                                  item={{
                                    label: drink.name,
                                    price: drink.price,
                                  }}
                                  aria-label={`${addLabel} ${drink.name} to cart`}
                                  pendingChildren={
                                    <>
                                      <CommerceMutationSpinner className="size-3" />
                                      Adding
                                    </>
                                  }
                                  className="inline-flex h-8 items-center justify-center gap-1.5 border border-border px-3 text-xs tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-70"
                                >
                                  {addLabel}
                                </CommerceAddItemButton>
                              }
                            </MenuItemAction>
                          </MenuItemPriceColumn>
                        </MenuItemContent>
                      </MenuItemRow>
                    ))}
                  </div>
                </div>
              ))}
            </ResponsiveGrid>

            <div className="mt-16 border border-border p-8 text-center">
              <p className="mb-4 text-muted-foreground">{footnote}</p>
              <NavbarRouteLink
                className="border-b border-muted-foreground pb-1 text-sm tracking-wide transition-colors hover:border-foreground hover:text-foreground"
                href={footnoteCta}
              >
                {footnoteCta}
              </NavbarRouteLink>
            </div>
          </MenuList>
        </Container>
      </section>
    )
  },
})
