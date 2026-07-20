import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MenuList } from '#/section-kit/MenuList.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CafeMenu — warm newsprint-menu ledger for a neighborhood cafe / coffee shop
 * page. Opens with a full-bleed inverted foreground-on-background heading band
 * whose bottom edge is cut on a diagonal clip-path seam: inside, a mono
 * dateline row (cap text as a mono stamp beside a hairline rule and edition
 * label) above an asymmetric 7:5 pairing of the oversized serif heading with
 * the right-aligned lead paragraph, over a giant serif ghost "Menu" watermark.
 * Below, a two-column ledger separated by a newspaper column rule: each column
 * is headed by a mono index numeral + serif title over a double rule, then
 * ledger rows — serif item name (routing to the menu target), dotted price
 * leader, serif italic price, muted description, and a square mono add-to-cart
 * stamp chip that floods dark on hover with press feedback. A teas &
 * non-coffee band closes the section as a collapsed-border 2/4-column grid of
 * hairline cells. Rows seed the shared product command search catalog and add
 * into the shared Lakebed cart used by the cafe navigation. Use for cafes,
 * bakeries, tea houses, brunch spots, or any cozy eatery wanting a readable,
 * conversion-focused menu section. Renders fully with no props via baked-in
 * defaults.
 */
export const CafeMenu = defineCapsule({
  name: 'CafeMenu',
  description:
    'Warm newsprint-menu ledger for a cozy cafe page: a full-bleed inverted heading band with a diagonal clip-path bottom seam holds a mono dateline row (cap stamp, hairline rule, edition label) above an asymmetric 7:5 serif heading + right-aligned lead pairing over a giant serif ghost watermark; below, a two-column ledger split by a newspaper column rule — each column headed by a mono index numeral and serif title over a double rule, with ledger rows of serif item names (routing to the menu target), dotted price leaders, serif italic prices, muted descriptions, and square mono add-to-cart stamp chips with press feedback — then a teas & non-coffee collapsed-border grid of hairline cells. Rows seed the shared product command search catalog and mutate the shared Lakebed cart used by cafe navigation. Use for cafes, bakeries, tea houses, brunch spots, or cozy eateries wanting a readable menu section.',
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
        className="inline-flex h-7 shrink-0 items-center justify-center gap-1.5 border border-foreground/25 bg-background px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors duration-150 hover:border-foreground hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
      >
        {addLabel}
      </CommerceAddItemButton>
    )

    const MenuLedgerRow = ({
      item,
    }: {
      item: { name: string; description: string; price: string }
    }) => (
      <div>
        <div className="flex items-baseline gap-3">
          <NavbarRouteLink
            className="font-serif text-base font-medium text-foreground transition-colors hover:text-primary sm:text-lg"
            href={menuTarget}
          >
            {item.name}
          </NavbarRouteLink>
          <span
            aria-hidden="true"
            className="mb-1 min-w-4 flex-1 border-b border-dotted border-foreground/30"
          />
          <span className="shrink-0 font-serif text-lg italic text-foreground">
            {item.price}
          </span>
        </div>
        <div className="mt-1 flex items-end justify-between gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
          <MenuAddButton item={item} />
        </div>
      </div>
    )

    const ColumnHeader = ({
      index,
      title,
    }: {
      index: string
      title: string
    }) => (
      <div className="border-b-[3px] border-double border-foreground/25 pb-3">
        <MonoTag tone="primary">{index}</MonoTag>
        <h3 className="mt-1.5 font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          {title}
        </h3>
      </div>
    )

    return (
      <section className={cn('bg-background pb-16 lg:pb-24', props.className)}>
        <MenuList>
          {/* Inverted heading band, cut on a diagonal seam at the bottom. */}
          <div className="relative overflow-hidden bg-foreground pt-24 pb-20 text-background [clip-path:polygon(0_0,100%_0,100%_calc(100%-3rem),0_100%)] lg:pt-28 lg:pb-24">
            <Watermark className="-bottom-8 right-[-2%] font-serif text-[6rem] italic tracking-tight text-background/[0.06] sm:text-[9rem] lg:text-[13rem]">
              {heading.split(' ')[0] ?? ''}
            </Watermark>
            <Container size="xl" className="relative px-6">
              <div className="flex items-center gap-4">
                <MonoTag tone="inverted">{cap}</MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-background/20"
                />
                <MonoTag
                  tone="inverted"
                  className="hidden text-background/50 sm:inline"
                >
                  No. 02 — Daily
                </MonoTag>
              </div>
              <SectionHeading
                title={heading}
                subtitle={description}
                align="left"
                className="mt-5 grid max-w-none gap-4 lg:grid-cols-12 lg:items-end lg:gap-10"
                titleClassName="font-serif text-4xl font-medium tracking-tight text-background sm:text-5xl lg:col-span-7 lg:text-6xl"
                subtitleClassName="max-w-md text-base leading-relaxed text-background/70 lg:col-span-5 lg:justify-self-end lg:text-right"
              />
            </Container>
          </div>

          <Container size="xl" className="mt-12 px-6 lg:mt-16">
            {/* Two-column ledger with a newspaper column rule. */}
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
              {[
                { index: '01', title: coffeeTitle, items: coffee },
                { index: '02', title: foodTitle, items: food },
              ].map((col, colIdx) => (
                <div
                  key={col.title}
                  className={cn(
                    'space-y-7',
                    colIdx === 1 &&
                      'lg:border-l lg:border-foreground/15 lg:pl-14',
                    colIdx === 0 && 'lg:pr-14',
                  )}
                >
                  <ColumnHeader index={col.index} title={col.title} />
                  <div className="space-y-6">
                    {(col.items ?? []).map((item) => (
                      <MenuLedgerRow
                        key={`${col.title}:${item.name}`}
                        item={item}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Teas & non-coffee — collapsed-border hairline grid. */}
            <div className="mt-16 lg:mt-20">
              <div className="flex items-center gap-4">
                <MonoTag tone="primary">03</MonoTag>
                <h3 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                  {teaTitle}
                </h3>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <div className="mt-6 grid grid-cols-1 border-t border-l border-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
                {teas.map((tea) => (
                  <div
                    key={tea.name}
                    className="flex flex-col border-r border-b border-foreground/15 bg-muted/30 p-5 sm:p-6"
                  >
                    <div className="flex items-baseline gap-3">
                      <h4 className="font-serif text-base font-medium text-foreground">
                        {tea.name}
                      </h4>
                      <span
                        aria-hidden="true"
                        className="mb-1 min-w-3 flex-1 border-b border-dotted border-foreground/30"
                      />
                      <span className="shrink-0 font-serif italic text-foreground">
                        {tea.price}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {tea.description}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <MenuAddButton item={tea} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </MenuList>
      </section>
    )
  },
})
