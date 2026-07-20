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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  MenuCategoryHeader,
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
import { MenuList } from '#/section-kit/MenuList.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * BarNightclubMenu — inverted poster drinks ledger for a cocktail-bar /
 * nightclub page. A full foreground-on-background inversion band whose top
 * edge cuts in on a slanted clip-path seam (neighbor-independent), with a
 * giant ghost "$" watermark. Asymmetric header: ticket-stub eyebrow chip and
 * giant condensed uppercase heading left, lead paragraph and mono pour-count
 * right. Below, a two-column ledger of named menu sections, each headed by a
 * hollow index numeral + mono uppercase title over a dashed rule; every row is
 * a hairline-divided ledger line with a bold uppercase name, muted
 * description, mono tabular price, and a scoped ticket-chip add-to-cart
 * control that writes to the shared Lakebed cart. Rows seed command search.
 * Closes with a dashed ticket-stub footnote panel and a routable
 * download-menu link. Use to present a cocktail / drinks list for bars,
 * lounges, speakeasies, or restaurants.
 */
export const BarNightclubMenu = defineCapsule({
  name: 'BarNightclubMenu',
  description:
    'Inverted poster drinks ledger for a cocktail-bar / nightclub page: a full foreground-on-background inversion band with a slanted clip-path top seam and giant ghost "$" watermark, an asymmetric header (ticket-stub eyebrow chip + giant condensed uppercase heading left, lead and mono pour-count right), then a two-column ledger of named menu sections, each headed by a hollow index numeral and mono uppercase title over a dashed rule, with hairline-divided rows showing a bold uppercase name, muted description, mono tabular price, and a scoped ticket-chip add-to-cart control that writes to the shared Lakebed cart. Rows seed command search. Closes with a dashed ticket-stub footnote panel and a routable download-menu link. Use to present a cocktail / drinks list for bars, lounges, speakeasies, or restaurants.',
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
          // Slanted top seam: the inversion band cuts in on a diagonal,
          // independent of whichever section sits above it.
          'relative overflow-hidden bg-foreground pb-14 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36',
          props.className,
        )}
      >
        <Watermark className="-left-4 bottom-0 text-[10rem] text-background/[0.05] sm:text-[18rem]">
          $
        </Watermark>
        <Container className="relative">
          <MenuList>
            <div className="mb-10 grid grid-cols-1 gap-6 sm:mb-14 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-3 border border-background/40 px-3 py-1.5">
                  <MonoTag
                    tone="inverted"
                    className="text-[10px] text-background"
                  >
                    {eyebrow}
                  </MonoTag>
                  <span
                    aria-hidden="true"
                    className="h-3 border-l border-dashed border-background/40"
                  />
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-primary"
                  />
                </span>
                <h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-tighter text-background sm:text-5xl lg:text-6xl">
                  {heading}
                </h2>
              </div>
              <div className="lg:col-span-5 lg:pb-1">
                <p className="max-w-md leading-relaxed text-background/70">
                  {description}
                </p>
                <MonoTag
                  aria-hidden="true"
                  tone="inverted"
                  className="mt-3 block text-[10px] text-background/50"
                >
                  {String(allDrinks.length).padStart(2, '0')} / pours
                </MonoTag>
              </div>
            </div>

            <ResponsiveGrid cols="1-md-2" className="gap-10 lg:gap-16">
              {columns.map((col, colIndex) => (
                <div key={col.title}>
                  <MenuCategoryHeader className="mb-6 gap-3 border-b-2 border-dashed border-background/30 pb-3">
                    <span
                      aria-hidden="true"
                      className="select-none text-3xl font-black leading-none tracking-tighter text-background/60 [-webkit-text-fill-color:transparent] [-webkit-text-stroke-width:1.5px]"
                    >
                      {String(colIndex + 1).padStart(2, '0')}
                    </span>
                    <MenuCategoryTitle className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-background">
                      {col.title}
                    </MenuCategoryTitle>
                  </MenuCategoryHeader>
                  <div>
                    {(col.items ?? []).map((drink) => (
                      <MenuItemRow
                        key={`${col.title}:${drink.name}`}
                        className="group border-b border-background/15 py-4 transition-colors last:border-b-0 hover:bg-background/5"
                      >
                        <MenuItemContent>
                          <MenuItemBody>
                            <MenuItemNameRow>
                              <MenuItemName className="text-sm font-black uppercase tracking-tight text-background sm:text-base">
                                {drink.name}
                              </MenuItemName>
                              <span
                                aria-hidden="true"
                                className="hidden h-px min-w-6 flex-1 border-b border-dotted border-background/30 sm:block"
                              />
                            </MenuItemNameRow>
                            <MenuItemRowDescription className="text-background/60">
                              {drink.description}
                            </MenuItemRowDescription>
                          </MenuItemBody>
                          <MenuItemPriceColumn>
                            <MenuItemRowPrice className="whitespace-nowrap font-mono text-base font-black tracking-tight text-background tabular-nums">
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
                                  className="inline-flex h-8 items-center justify-center gap-1.5 border border-background/40 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-background transition-colors duration-100 hover:bg-background hover:text-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
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

            <div className="mt-12 flex flex-col items-start gap-4 border-2 border-dashed border-background/40 p-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <p className="text-background/70">{footnote}</p>
              <NavbarRouteLink
                className="inline-flex items-center gap-2 border-b-2 border-background/50 pb-1 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:border-background active:translate-y-px"
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
